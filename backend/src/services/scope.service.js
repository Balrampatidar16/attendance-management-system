import User from '../models/User.model.js';

// Central place for role-based data scoping so controllers never hand-roll RBAC filters.
// employee -> only self | manager -> self + direct reports | admin -> everything.

export const getTeamMemberIds = async (managerId) => {
  const team = await User.find({ manager: managerId }).select('_id').lean();
  return team.map((u) => u._id);
};

// Returns a Mongo filter over the User collection scoped to what reqUser may see.
export const getScopedUserFilter = async (reqUser) => {
  if (reqUser.role === 'admin') return {};
  if (reqUser.role === 'manager') {
    const teamIds = await getTeamMemberIds(reqUser._id);
    return { _id: { $in: [reqUser._id, ...teamIds] } };
  }
  return { _id: reqUser._id };
};

// Returns the list of user IDs reqUser may see records for (e.g. attendance.user, overtime.user).
// null means "no restriction" (admin).
export const getScopedUserIds = async (reqUser) => {
  if (reqUser.role === 'admin') return null;
  if (reqUser.role === 'manager') {
    const teamIds = await getTeamMemberIds(reqUser._id);
    return [reqUser._id, ...teamIds];
  }
  return [reqUser._id];
};

export const canAccessUser = async (reqUser, targetUserId) => {
  if (reqUser.role === 'admin') return true;
  if (String(reqUser._id) === String(targetUserId)) return true;
  if (reqUser.role === 'manager') {
    const target = await User.findById(targetUserId).select('manager').lean();
    return !!target && String(target.manager) === String(reqUser._id);
  }
  return false;
};
