import User from "./User";
import Prize from "./Prize";
import Redemption from "./Redemption";
import PointHistory from "./PointHistory";
import Activity from "./Activity";
import ActivityEntry from "./ActivityEntry";
import Notification from "./Notification";
import SocialMedia from "./SocialMedia";
import Agreement from "./Agreement";
import AgreementImage from "./AgreementImage";
import PointRequest from "./PointRequest";
import ChildrenDay from "./ChildrenDay";
import ChildrenDayVotes from "./ChildrenDayVote";
import ActivityQuestion from "./ActivityQuestion";
import ActivityAnswer from "./ActivityAnswer";
import DuelComment from "./DuelComment";
import PlatformUpdate from "./PlatformUpdate";
// User associations
User.hasMany(Redemption, { foreignKey: "user_id", as: "redemptions" });
User.hasMany(PointHistory, { foreignKey: "user_id", as: "pointHistory" });
User.hasMany(ActivityEntry, { foreignKey: "user_id", as: "entries" });
User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });
User.hasMany(ActivityAnswer, { foreignKey: "user_id", as: "entrie_answers" });

// Prize associations
Prize.hasMany(Redemption, { foreignKey: "prize_id", as: "redemptions" });

// Redemption associations
Redemption.belongsTo(User, { foreignKey: "user_id", as: "user" });
Redemption.belongsTo(Prize, { foreignKey: "prize_id", as: "prize" });
Redemption.belongsTo(User, { foreignKey: "delivered_by", as: "delivered" });
// PointHistory associations
PointHistory.belongsTo(User, { foreignKey: "user_id", as: "user" });
PointHistory.belongsTo(User, { foreignKey: "assigned_by", as: "assigner" });

// Activity associations
Activity.hasMany(ActivityEntry, { foreignKey: "activity_id", as: "entries" });
Activity.hasMany(ActivityQuestion, {
  foreignKey: "activity_id",
  as: "questions",
});

// ActivityEntry associations
ActivityEntry.belongsTo(User, { foreignKey: "user_id", as: "user" });
ActivityEntry.belongsTo(Activity, {
  foreignKey: "activity_id",
  as: "activity",
});
ActivityEntry.belongsTo(User, { foreignKey: "reviewed_by", as: "reviewer" });

// Notification associations
Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });

// PointRequest associations
PointRequest.belongsTo(User, { foreignKey: "requester_id", as: "requester" });
PointRequest.belongsTo(User, { foreignKey: "target_id", as: "target" });
User.hasMany(PointRequest, { foreignKey: "requester_id", as: "sentRequests" });
User.hasMany(PointRequest, { foreignKey: "target_id", as: "receivedRequests" });

//Social Media
Activity.hasMany(SocialMedia, {
  foreignKey: "activity_id",
  as: "social_medias",
});

SocialMedia.belongsTo(Activity, {
  foreignKey: "activity_id",
  as: "activity",
});

// AgreementImage associations
Agreement.hasMany(AgreementImage, {
  foreignKey: "agreement_id",
  as: "images",
  onDelete: "CASCADE",
});
AgreementImage.belongsTo(Agreement, {
  foreignKey: "agreement_id",
  as: "agreement",
});

// Activities Questions associations
ActivityQuestion.hasOne(ActivityAnswer, {
  foreignKey: "activity_question_id",
  as: "answers",
});
ActivityQuestion.belongsTo(Activity, {
  foreignKey: "activity_id",
  as: "activity",
});

// Activities answer associations
ActivityAnswer.belongsTo(ActivityQuestion, {
  foreignKey: "activity_question_id",
  as: "question",
});
ActivityAnswer.belongsTo(User, { foreignKey: "user_id", as: "user" });

//chidren day
ChildrenDay.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});
ChildrenDay.hasMany(ChildrenDayVotes, {
  foreignKey: "children_day_id",
  as: "votes",
});
// ChildrenDay.hasMany(ChildrenDayVotes, {
//   foreignKey: "children_day_id",
//   as: "votesCount",
// });
ChildrenDayVotes.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});
//children day votes
ChildrenDayVotes.belongsTo(ChildrenDay, {
  foreignKey: "children_day_id",
  as: "children_day",
});

// DuelComment associations
DuelComment.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(DuelComment, { foreignKey: "user_id", as: "duelComments" });

// PlatformUpdate associations
PlatformUpdate.belongsTo(User, { foreignKey: "sent_by", as: "sender" });
User.hasMany(PlatformUpdate, { foreignKey: "sent_by", as: "platformUpdates" });

export {
  User,
  Prize,
  Redemption,
  PointHistory,
  Activity,
  ActivityEntry,
  Notification,
  Agreement,
  AgreementImage,
  PointRequest,
  ChildrenDay,
  ChildrenDayVotes,
};
