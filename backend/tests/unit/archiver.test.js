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

describe('Archiver Logic — 3-Step Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should mark expired, archive after 2 days, and move files', async () => {
    const fsPromises = require('fs/promises');

    // Step 1: active → expired (UPDATE SET status='expired')
    pool.query.mockResolvedValueOnce({ rowCount: 3 });

    // Step 2: expired → archived (UPDATE SET status='archived' RETURNING id)
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });

    // Step 3: Cold items fetch (SELECT by archived IDs)
    const mockItems = [
      {
        id: 1,
        banner_image: '/uploads/banner.jpg',
        promo_video: '/uploads/video.mp4',
        video_variants: {}
      }
    ];
    pool.query.mockResolvedValueOnce({ rows: mockItems });

    // Step 3a: banner update query
    pool.query.mockResolvedValueOnce({ rowCount: 1 });
    // Step 3b: video update query
    pool.query.mockResolvedValueOnce({ rowCount: 1 });

    await archiveExpiredOpportunities();

    // Verify async rename was called (banner + video)
    expect(fsPromises.rename).toHaveBeenCalledTimes(2);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE opportunities SET banner_image"),
      expect.arrayContaining(['/archive/banner.jpg', 1])
    );
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE opportunities SET promo_video"),
      expect.arrayContaining(['/archive/video.mp4', 1])
    );
  });

  test('should handle no expired and no archived gracefully', async () => {
    // Step 1: No active → expired
    pool.query.mockResolvedValueOnce({ rowCount: 0 });
    // Step 2: No expired → archived
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    await expect(archiveExpiredOpportunities()).resolves.not.toThrow();
  });

  test('should skip cold storage when no items are archived', async () => {
    const fsPromises = require('fs/promises');

    // Step 1: 2 items expired
    pool.query.mockResolvedValueOnce({ rowCount: 2 });
    // Step 2: 0 items archived (all still in grace period)
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    await archiveExpiredOpportunities();

    // No file moves should happen
    expect(fsPromises.rename).not.toHaveBeenCalled();
  });
});
