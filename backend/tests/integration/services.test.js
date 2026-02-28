const BaseService = require('../../services/BaseService');
const OpportunityService = require('../../services/OpportunityService');

// Mock Repository
const mockRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('BaseService Unit Tests', () => {
  let service;

  beforeEach(() => {
    service = new BaseService(mockRepo);
    jest.clearAllMocks();
  });

  test('getAll should call repository.findAll', async () => {
    mockRepo.findAll.mockResolvedValue(['item1', 'item2']);
    const result = await service.getAll();
    expect(mockRepo.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(2);
  });

  test('getById should throw if not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.getById(1)).rejects.toThrow("Not found");
  });
});

describe('OpportunityService Validation Tests', () => {
  test('Should throw error if required fields are missing', () => {
    expect(() => {
      OpportunityService._validateOpportunityData({});
    }).toThrow("Lipsesc câmpuri obligatorii");
  });

  test('Should throw error if deadline is in the past', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const data = {
      title: "Test",
      type: "job",
      description: "Desc",
      deadline: pastDate.toISOString()
    };

    expect(() => {
      OpportunityService._validateOpportunityData(data);
    }).toThrow(/trecut/);
  });

  test('Should pass for valid future data', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const data = {
      title: "Valid",
      type: "internship",
      description: "Desc",
      deadline: futureDate.toISOString()
    };

    expect(() => {
      OpportunityService._validateOpportunityData(data);
    }).not.toThrow();
  });
});
