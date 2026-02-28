const BaseService = require("./BaseService");
const opportunityRepository = require("../repositories/OpportunityRepository");
const pointsManager = require("../utils/pointsManager");
const { notificationQueue, videoQueue } = require("../queues");
const path = require("path");
const fs = require("fs");

class OpportunityService extends BaseService {
  constructor() {
    super(opportunityRepository);
  }

  async getOpportunities(queryFilters) {
    return this.repository.findWithFilters(queryFilters);
  }

  async getOpportunityDetails(id) {
    const opportunity = await this.repository.findDetailedById(id);
    if (!opportunity) {
      throw new Error("Opportunity not found");
    }
    return opportunity;
  }

  // --- Organization Flow ---

  async createOpportunity(userId, data, userFullName) {
    this._validateOpportunityData(data);

    // Transactional creation + points
    console.log("[OpportunityService] Creating opportunity with data:", JSON.stringify(data, null, 2));
    return pointsManager.performTransaction(async (client) => {
      // 1. Create Opportunity
      const { mentors, participants, reviews, gallery, ...cleanData } = data;

      // Ensure JSON fields are stringified for Postgres if they are arrays/objects
      if (cleanData.agenda && typeof cleanData.agenda === 'object') {
        cleanData.agenda = JSON.stringify(cleanData.agenda);
      }
      if (cleanData.faq && typeof cleanData.faq === 'object') {
        cleanData.faq = JSON.stringify(cleanData.faq);
      }

      const opportunity = await this.repository.createOpportunity({
        user_id: userId,
        ...cleanData
      }, client);

      // 2. Award Points (5 pts)
      // Using pointsManager which supports passing the client
      await pointsManager.addPoints(userId, 5, 'create_opportunity', client);

      // Side Effects (Non-Blocking, outside transaction usually, but queues are safe here)
      // Notify user
      notificationQueue.add("user-notification", {
        userId,
        title: "Ai primit 5 puncte! 💎",
        body: "Felicitări! Ai publicat o nouă oportunitate.",
        icon: '/albastru.svg',
        url: '/organization'
      }, { removeOnComplete: true }).catch(console.error);

      // Video Queue
      if (data.promo_video && data.promo_video.startsWith('/uploads/')) {
        const filename = data.promo_video.split('/').pop();
        // Assuming we are running from backend root, but path usually needs to be absolute or relative to this file
        // routes was using: path.join(__dirname, '../../uploads', filename)
        // Here we are in backend/services. backend/uploads is ../uploads
        const uploadsDir = path.join(__dirname, '../uploads');
        const filePath = path.join(uploadsDir, filename);

        videoQueue.add('process-video', {
          filePath,
          filename,
          userId,
          opportunityId: opportunity.id
        }).catch(console.error);
      }

      // Push Notification to all users
      const orgName = userFullName || "O organizație";
      const shortDesc = data.description && data.description.length > 50
        ? data.description.substring(0, 50) + "..."
        : (data.description || "Vezi detalii în aplicație!");

      notificationQueue.add("opportunity-push", {
        title: `${orgName}: ${data.title}`,
        body: shortDesc,
        icon: '/albastru.svg',
        data: { url: `/student/opportunities/${opportunity.id}` }
      }, {
        removeOnComplete: true,
        attempts: 3
      }).catch(console.error);

      return { ...opportunity, pointsAdded: 5, reason: "create_opportunity" };
    });
  }

  async updateOpportunity(id, userId, data) {
    if (data.deadline || data.title || data.description) {
      this._validateOpportunityData(data, true);
    }

    // Logic to delete old video if replaced
    const currentOpp = await this.repository.findByIdAndUser(id, userId);
    if (!currentOpp) throw new Error("Opportunity not found or unauthorized");

    if (data.promo_video && currentOpp.promo_video && data.promo_video !== currentOpp.promo_video) {
      try {
        const oldVideo = currentOpp.promo_video;
        const relativePath = oldVideo.startsWith('/') ? oldVideo.substring(1) : oldVideo;
        // backend/services -> backend/uploads (../../ if path is relative from root, wait. 
        // from services: ../
        // if oldVideo is "uploads/foo.mp4", then join(__dirname, '../', relativePath) -> backend/services/../uploads/foo.mp4 -> backend/uploads/foo.mp4. Correct.
        const oldFilePath = path.join(__dirname, '../', relativePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log(`[Update Opportunity] Deleted old video: ${oldFilePath}`);
        }
      } catch (err) {
        console.error("[Update Opportunity] Error deleting old video:", err);
      }
    }

    // Sanitize data -> Remove deprecated fields that might still be sent by frontend
    const { mentors, participants, reviews, gallery, ...cleanData } = data;

    if (cleanData.agenda && typeof cleanData.agenda === 'object') {
      cleanData.agenda = JSON.stringify(cleanData.agenda);
    }
    if (cleanData.faq && typeof cleanData.faq === 'object') {
      cleanData.faq = JSON.stringify(cleanData.faq);
    }

    const updated = await this.repository.updateOpportunity(id, userId, cleanData);

    // Re-activare automată: dacă organizația a prelungit deadline-ul pe o oportunitate expirată
    if (data.deadline && currentOpp.status === 'expired') {
      const newDeadline = new Date(data.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (newDeadline >= today) {
        await this.repository.pool.query(
          "UPDATE opportunities SET status = 'active' WHERE id = $1 AND user_id = $2",
          [id, userId]
        );
        console.log(`[OpportunityService] Re-activated expired opp ${id} with new deadline ${data.deadline}`);
      }
    }

    // Video Processing for Update
    if (data.promo_video && data.promo_video.startsWith('/uploads/')) {
      const filename = data.promo_video.split('/').pop();
      const uploadsDir = path.join(__dirname, '../uploads');
      const filePath = path.join(uploadsDir, filename);

      videoQueue.add('process-video', {
        filePath,
        filename,
        userId,
        opportunityId: id
      }).catch(err => console.error("Video Queue Error (Update):", err));
    }

    return updated;
  }

  _validateOpportunityData(data, isUpdate = false) {
    if (!isUpdate) {
      if (!data.title || !data.type || !data.deadline || !data.description) {
        throw new Error("Lipsesc câmpuri obligatorii");
      }
    }

    if (data.deadline) {
      const deadlineDate = new Date(data.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        throw new Error("Deadline-ul nu poate fi în trecut! Te rugăm să alegi o dată din viitor.");
      }
    }
  }

  async deleteOpportunity(id, userId) {
    const deleted = await this.repository.deleteOpportunity(id, userId);
    if (!deleted) throw new Error("Opportunity not found or unauthorized");
    return deleted;
  }

  async getExploreOpportunity(id) {
    const opportunity = await this.repository.findExploreById(id);
    if (!opportunity) throw new Error("Opportunity not found");
    return opportunity;
  }

  async getExploreOthers(userId) {
    return this.repository.findExploreOthers(userId);
  }

  async getMyOpportunities(userId, status) {
    // If status is not provided, default to 'active' was logic in route, but usually controller handles defaults.
    // We'll trust the controller to pass it or handle it here.
    const effectiveStatus = status || 'active';
    return this.repository.findByUserIdAndStatus(userId, effectiveStatus);
  }

  async getPublicOpportunities(targetUserId) {
    return this.repository.findByUserId(targetUserId);
  }

  async getOpportunityForOrg(id, userId) {
    const opp = await this.repository.findByIdAndUser(id, userId);
    if (!opp) throw new Error("Not found");
    return opp;
  }
}

module.exports = new OpportunityService();
