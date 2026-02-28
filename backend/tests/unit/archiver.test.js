// Unmock the archiver — setup.js mocks it globally, but we want the REAL one here
jest.unmock('../../jobs/archiver');

const { pool } = require('../../db');

jest.mock('../../db', () => ({
  pool: {
    query: jest.fn(),
  },
}));

// Mock fs/promises (async rename — archiver uses fs.promises.rename)
jest.mock('fs/promises', () => ({
  rename: jest.fn().mockResolvedValue(undefined),
}));

// Mock fs (sync) for existsSync / mkdirSync used in archiver
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
}));

// Mock path so __dirname references resolve cleanly
jest.mock('path', () => {
  const actual = jest.requireActual('path');
  return {
    ...actual,
    join: jest.fn((...args) => actual.join(...args)),
  };
});

// Must require archiver AFTER mocks are set up
const { archiveExpiredOpportunities } = require('../../jobs/archiver');

describe('Archiver Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should archive expired opportunities and move files async', async () => {
    const fsPromises = require('fs/promises');

    // 1. Mock expired update (UPDATE opportunities SET status='archived')
    pool.query.mockResolvedValueOnce({ rowCount: 5 });

    // 2. Mock cold items fetch (30+ days expired, with files to move)
    const mockItems = [
      {
        id: 1,
        banner_image: '/uploads/banner.jpg',
        promo_video: '/uploads/video.mp4',
        video_variants: {}
      }
    ];
    pool.query.mockResolvedValueOnce({ rows: mockItems });

    // 3. Mock banner update query
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    // 4. Mock video update query
    pool.query.mockResolvedValueOnce({ rowCount: 1 });

    await archiveExpiredOpportunities();

    // Verify async rename was called (not renameSync)
    expect(fsPromises.rename).toHaveBeenCalledTimes(2); // banner + video
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE opportunities SET banner_image"),
      expect.arrayContaining(['/archive/banner.jpg', 1])
    );
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE opportunities SET promo_video"),
      expect.arrayContaining(['/archive/video.mp4', 1])
    );
  });

  test('should handle already-archived items gracefully', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 }); // No expired updates
    pool.query.mockResolvedValueOnce({ rows: [] }); // No cold items

    await expect(archiveExpiredOpportunities()).resolves.not.toThrow();
  });
});
