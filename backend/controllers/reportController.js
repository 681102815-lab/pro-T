const Report = require('../models/Report');

// Helper function to parse comments
const parseComments = (commentData) => {
  if (!commentData) return [];
  return commentData.split('::').filter(c => c).map(c => {
    const [id, author, text, createdAt] = c.split('|');
    return { id, author, text, createdAt };
  });
};

// Get all reports
exports.getAllReports = (req, res) => {
  Report.getAll((err, reports) => {
    if (err) {
      console.error('❌ Error fetching reports:', err);
      return res.status(500).json({ error: true, message: err.message });
    }
    console.log(`📊 Fetching all reports: found ${reports?.length || 0} reports`);
    const formattedReports = reports.map(r => ({
      ...r,
      comments: parseComments(r.comments_data)
    })).map(({ comments_data, ...rest }) => rest);
    
    res.json({
      error: false,
      count: reports.length,
      data: formattedReports
    });
  });
};

// Get user's reports
exports.getUserReports = (req, res) => {
  const { username } = req.params;
  Report.getByUsername(username, (err, reports) => {
    if (err) {
      return res.status(500).json({ error: true, message: err.message });
    }
    const formattedReports = reports.map(r => ({
      ...r,
      comments: parseComments(r.comments_data)
    })).map(({ comments_data, ...rest }) => rest);
    
    res.json({
      error: false,
      count: reports.length,
      data: formattedReports
    });
  });
};

// Create report
exports.createReport = (req, res) => {
  const { reportId, category, detail, owner } = req.body;
  
  console.log('📝 Creating report:', { reportId, category, detail: detail?.substring(0,50), owner });

  if (!reportId || !category || !detail || !owner) {
    console.warn('❌ Missing fields:', { reportId, category, detail: !!detail, owner });
    return res.status(400).json({ error: true, message: 'Missing required fields' });
  }

  Report.create({ reportId, category, detail, owner }, (err, report) => {
    if (err) {
      console.error('❌ Error creating report:', err);
      return res.status(500).json({ error: true, message: err.message });
    }
    console.log('✓ Report created successfully:', report.id);
    res.status(201).json({
      error: false,
      message: 'Report created successfully',
      data: {
        ...report,
        comments: parseComments(report.comments_data)
      }
    });
  });
};

// Update report status
exports.updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['รอรับเรื่อง', 'กำลังดำเนินการ', 'เสร็จสิ้น'].includes(status)) {
    return res.status(400).json({ error: true, message: 'Invalid status' });
  }

  Report.updateStatus(id, status, (err, report) => {
    if (err) {
      return res.status(500).json({ error: true, message: err.message });
    }
    if (!report) {
      return res.status(404).json({ error: true, message: 'Report not found' });
    }
    res.json({
      error: false,
      message: 'Status updated successfully',
      data: {
        ...report,
        comments: parseComments(report.comments_data)
      }
    });
  });
};

// Add feedback
exports.addFeedback = (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;

  if (!feedback) {
    return res.status(400).json({ error: true, message: 'Feedback is required' });
  }

  Report.addFeedback(id, feedback, (err, report) => {
    if (err) {
      return res.status(500).json({ error: true, message: err.message });
    }
    if (!report) {
      return res.status(404).json({ error: true, message: 'Report not found' });
    }
    res.json({
      error: false,
      message: 'Feedback added successfully',
      data: {
        ...report,
        comments: parseComments(report.comments_data)
      }
    });
  });
};

// Add comment
exports.addComment = (req, res) => {
  const { id } = req.params;
  const { author, text } = req.body;

  if (!author || !text) {
    return res.status(400).json({ error: true, message: 'Author and text required' });
  }

  Report.addComment(id, author, text, (err, report) => {
    if (err) {
      return res.status(500).json({ error: true, message: err.message });
    }
    if (!report) {
      return res.status(404).json({ error: true, message: 'Report not found' });
    }

    const comments = parseComments(report.comments_data);
    const newComment = comments[comments.length - 1];

    res.json({
      error: false,
      message: 'Comment added successfully',
      data: {
        comment: newComment,
        totalComments: comments.length,
        allComments: comments
      }
    });
  });
};

// Delete report
exports.deleteReport = (req, res) => {
  const { id } = req.params;

  Report.delete(id, (err) => {
    if (err) {
      return res.status(500).json({ error: true, message: err.message });
    }
    res.json({
      error: false,
      message: 'Report deleted successfully'
    });
  });
};

// Get statistics
exports.getStatistics = (req, res) => {
  Report.getStatistics((err, stats) => {
    if (err) {
      return res.status(500).json({ error: true, message: err.message });
    }
    const stat = stats[0];
    const totalReports = stat.totalReports || 0;
    const completionRate = totalReports > 0 ? Math.round(((stat.completed || 0) / totalReports) * 100) : 0;

    res.json({
      error: false,
      data: {
        totalReports,
        completed: stat.completed || 0,
        inProgress: stat.inProgress || 0,
        waiting: stat.waiting || 0,
        completionRate
      }
    });
  });
};

// Like report
exports.likeReport = (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: true, message: 'Username is required' });
  }

  Report.likeReport(id, username, (err, report) => {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: true, message: 'You already liked this report' });
      }
      return res.status(500).json({ error: true, message: err.message });
    }
    if (!report) {
      return res.status(404).json({ error: true, message: 'Report not found' });
    }
    res.json({
      error: false,
      message: 'Report liked successfully',
      data: {
        likes: report.likesCount,
        dislikes: report.dislikesCount
      }
    });
  });
};

// Dislike report
exports.dislikeReport = (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: true, message: 'Username is required' });
  }

  Report.dislikeReport(id, username, (err, report) => {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: true, message: 'You already disliked this report' });
      }
      return res.status(500).json({ error: true, message: err.message });
    }
    if (!report) {
      return res.status(404).json({ error: true, message: 'Report not found' });
    }
    res.json({
      error: false,
      message: 'Report disliked successfully',
      data: {
        likes: report.likesCount,
        dislikes: report.dislikesCount
      }
    });
  });
};

// Remove like/dislike
exports.removeLikeDislike = (req, res) => {
  const { id } = req.params;
  const { username, type } = req.body;

  if (!username || !type || (type !== 'like' && type !== 'dislike')) {
    return res.status(400).json({ error: true, message: 'Username and valid type (like/dislike) are required' });
  }

  const callback = (err, report) => {
    if (err) {
      return res.status(500).json({ error: true, message: err.message });
    }
    if (!report) {
      return res.status(404).json({ error: true, message: 'Report not found' });
    }
    res.json({
      error: false,
      message: `${type} removed successfully`,
      data: {
        likes: report.likesCount,
        dislikes: report.dislikesCount
      }
    });
  };

  if (type === 'like') {
    Report.removeLike(id, username, callback);
  } else {
    Report.removeDislike(id, username, callback);
  }
};
