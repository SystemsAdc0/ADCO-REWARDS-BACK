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
import ActivityQuestion from "./ActivityQuestion";
import ActivityAnswer from "./ActivityAnswer";
import DuelComment from "./DuelComment";
import PlatformUpdate from "./PlatformUpdate";

// Courses
import Department from "./courses/Department";
import Course from "./courses/Course";
import CourseModule from "./courses/CourseModule";
import CourseModuleSection from "./courses/CourseModuleSection";
import CourseModuleSectionLink from "./courses/CourseModuleSectionLink";
import CourseModuleSectionActivity from "./courses/CourseModuleSectionActivity";
import CourseModuleSectionEvidence from "./courses/CourseModuleSectionEvidence";
import CourseModuleSectionExam from "./courses/CourseModuleSectionExam";
import CourseModuleSectionQuestion from "./courses/CourseModuleSectionQuestion";
import CourseModuleSectionAnswer from "./courses/CourseModuleSectionAnswer";
import CourseModuleSectionQuestionUserAnswer from "./courses/CourseModuleSectionQuestionUserAnswer";
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

// DuelComment associations
DuelComment.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(DuelComment, { foreignKey: "user_id", as: "duelComments" });

// PlatformUpdate associations
PlatformUpdate.belongsTo(User, { foreignKey: "sent_by", as: "sender" });
User.hasMany(PlatformUpdate, { foreignKey: "sent_by", as: "platformUpdates" });

// ── Courses associations ─────────────────────────────────────────────────────

// Department ↔ User
Department.hasMany(User, { foreignKey: "department_id", as: "users" });
User.belongsTo(Department, { foreignKey: "department_id", as: "department" });

// Department → Course
Department.hasMany(Course, { foreignKey: "department_id", as: "courses" });
Course.belongsTo(Department, { foreignKey: "department_id", as: "department" });

// Course → CourseModule
Course.hasMany(CourseModule, { foreignKey: "course_id", as: "modules" });
CourseModule.belongsTo(Course, { foreignKey: "course_id", as: "course" });

// CourseModule → CourseModuleSection
CourseModule.hasMany(CourseModuleSection, {
  foreignKey: "course_module_id",
  as: "sections",
});
CourseModuleSection.belongsTo(CourseModule, {
  foreignKey: "course_module_id",
  as: "module",
});

// CourseModuleSection → CourseModuleSectionLink
CourseModuleSection.hasMany(CourseModuleSectionLink, {
  foreignKey: "course_module_section_id",
  as: "links",
});
CourseModuleSectionLink.belongsTo(CourseModuleSection, {
  foreignKey: "course_module_section_id",
  as: "section",
});

// CourseModuleSection → CourseModuleSectionActivity
CourseModuleSection.hasMany(CourseModuleSectionActivity, {
  foreignKey: "course_module_section_id",
  as: "activities",
});
CourseModuleSectionActivity.belongsTo(CourseModuleSection, {
  foreignKey: "course_module_section_id",
  as: "section",
});

// CourseModuleSectionActivity → CourseModuleSectionEvidence
CourseModuleSectionActivity.hasMany(CourseModuleSectionEvidence, {
  foreignKey: "course_module_section_activity_id",
  as: "evidence",
});
CourseModuleSectionEvidence.belongsTo(CourseModuleSectionActivity, {
  foreignKey: "course_module_section_activity_id",
  as: "activity",
});

// User → CourseModuleSectionEvidence
User.hasMany(CourseModuleSectionEvidence, {
  foreignKey: "user_id",
  as: "courseEvidence",
});
CourseModuleSectionEvidence.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// CourseModuleSectionActivity → CourseModuleSectionExam
CourseModuleSectionActivity.hasOne(CourseModuleSectionExam, {
  foreignKey: "course_module_section_activity_id",
  as: "exam",
});
CourseModuleSectionExam.belongsTo(CourseModuleSectionActivity, {
  foreignKey: "course_module_section_activity_id",
  as: "activity",
});

// CourseModuleSectionExam → CourseModuleSectionQuestion
CourseModuleSectionExam.hasMany(CourseModuleSectionQuestion, {
  foreignKey: "course_module_section_exam_id",
  as: "questions",
});
CourseModuleSectionQuestion.belongsTo(CourseModuleSectionExam, {
  foreignKey: "course_module_section_exam_id",
  as: "exam",
});

// CourseModuleSectionQuestion → CourseModuleSectionAnswer
CourseModuleSectionQuestion.hasMany(CourseModuleSectionAnswer, {
  foreignKey: "course_module_section_question_id",
  as: "answers",
});
CourseModuleSectionAnswer.belongsTo(CourseModuleSectionQuestion, {
  foreignKey: "course_module_section_question_id",
  as: "question",
});

// CourseModuleSectionQuestion → CourseModuleSectionQuestionUserAnswer
CourseModuleSectionQuestion.hasMany(CourseModuleSectionQuestionUserAnswer, {
  foreignKey: "question_id",
  as: "userAnswers",
});
CourseModuleSectionQuestionUserAnswer.belongsTo(CourseModuleSectionQuestion, {
  foreignKey: "question_id",
  as: "question",
});

// CourseModuleSectionAnswer → CourseModuleSectionQuestionUserAnswer
CourseModuleSectionAnswer.hasMany(CourseModuleSectionQuestionUserAnswer, {
  foreignKey: "answer_option_id",
  as: "userAnswers",
});
CourseModuleSectionQuestionUserAnswer.belongsTo(CourseModuleSectionAnswer, {
  foreignKey: "answer_option_id",
  as: "answer_option",
});

// User → CourseModuleSectionQuestionUserAnswer
User.hasMany(CourseModuleSectionQuestionUserAnswer, {
  foreignKey: "user_id",
  as: "courseUserAnswers",
});
CourseModuleSectionQuestionUserAnswer.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

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
  // Courses
  Department,
  Course,
  CourseModule,
  CourseModuleSection,
  CourseModuleSectionLink,
  CourseModuleSectionActivity,
  CourseModuleSectionEvidence,
  CourseModuleSectionExam,
  CourseModuleSectionQuestion,
  CourseModuleSectionAnswer,
  CourseModuleSectionQuestionUserAnswer,
};
