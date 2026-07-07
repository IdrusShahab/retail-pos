const parseDateRange = (startDate, endDate) => {
  const now = new Date();

  const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  const end = endDate ? new Date(endDate) : now;
  end.setHours(23, 59, 59, 999);

  if (start > end) {
    const error = new Error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
    error.statusCode = 400;
    throw error;
  }

  return { start, end };
};

module.exports = { parseDateRange };