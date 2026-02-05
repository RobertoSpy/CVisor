const { archiveExpiredOpportunities } = require('../../jobs/archiver');
const { pool } = require('../../db');
const fs = require('fs');
const path = require('path');

jest.mock('../../db', () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock('fs');
// Removed path mock to avoid cross-platform issues

describe('Archiver Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should move expired items to archive', async () => {
    // Default mock implementation to return empty success to prevent crashes on extra queries
    pool.query.mockResolvedValue({ rowCount: 1, rows: [] });

    // 1. Mock expired update
    pool.query.mockResolvedValueOnce({ rowCount: 5 });

    // 2. Mock cold items fetch
    const mockItems = [
      { id: 1, banner_image: '/uploads/banner.jpg', promo_video: '/uploads/video.mp4' }
    ];
    pool.query.mockResolvedValueOnce({ rows: mockItems });

    // 3. Mock FS
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockImplementation(() => { });
    fs.renameSync.mockImplementation(() => { });

    // 4. Run
    await archiveExpiredOpportunities();

    // 5. Verify moves
    expect(fs.renameSync).toHaveBeenCalledTimes(2); // Banner + Video
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE opportunities SET banner_image"),
      expect.arrayContaining(['/archive/banner.jpg', 1])
    );
  });
});
