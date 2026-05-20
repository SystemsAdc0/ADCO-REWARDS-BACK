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
import Module from "./courses/Module";
import Section from "./courses/Section";
import SectionContent from "./courses/SectionContent";
import SectionEvidence from "./courses/SectionEvidence";
import Exam from "./courses/Exam";
import ExamQuestion from "./courses/ExamQuestion";
import ExamAnswer from "./courses/ExamAnswer";
import ExamUserAnswer from "./courses/ExamUserAnswer";
import UserCourseProgress from "./courses/UserCourseProgress";
import UserCourseAssignment from "./courses/UserCourseAssignment";
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

// Course → Module
Course.hasMany(Module, { foreignKey: "course_id", as: "modules" });
Module.belongsTo(Course, { foreignKey: "course_id", as: "course" });

// Module → Section
Module.hasMany(Section, {
  foreignKey: "module_id",
  as: "sections",
});
Section.belongsTo(Module, {
  foreignKey: "module_id",
  as: "module",
});

// Section → SectionContent
Section.hasMany(SectionContent, {
  foreignKey: "section_id",
  as: "contents",
});
SectionContent.belongsTo(Section, {
  foreignKey: "section_id",
  as: "section",
});

// Section → Exam
Section.hasOne(Exam, {
  foreignKey: "section_id",
  as: "exam",
});
Exam.belongsTo(Section, {
  foreignKey: "section_id",
  as: "section",
});

// Section → SectionEvidence
Section.hasMany(SectionEvidence, {
  foreignKey: "section_id",
  as: "evidences",
});
SectionEvidence.belongsTo(Section, {
  foreignKey: "section_id",
  as: "section",
});

// User → SectionEvidence
User.hasMany(SectionEvidence, {
  foreignKey: "user_id",
  as: "courseEvidence",
});
User.hasMany(SectionEvidence, {
  foreignKey: "reviewed_by",
  as: "reviewedEvidence",
});

SectionEvidence.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});
SectionEvidence.belongsTo(User, {
  foreignKey: "reviewed_by",
  as: "reviewer",
});

// CourseModuleSectionActivity → CourseModuleSectionExam
// CourseModuleSectionActivity.hasOne(CourseModuleSectionExam, {
//   foreignKey: "course_module_section_activity_id",
//   as: "exam",
// });
// CourseModuleSectionExam.belongsTo(CourseModuleSectionActivity, {
//   foreignKey: "course_module_section_activity_id",
//   as: "activity",
// });

// Exam → ExamQuestion
Exam.hasMany(ExamQuestion, {
  foreignKey: "exam_id",
  as: "questions",
});
ExamQuestion.belongsTo(Exam, {
  foreignKey: "exam_id",
  as: "exam",
});

// ExamQuestion → ExamAnswer
ExamQuestion.hasMany(ExamAnswer, {
  foreignKey: "question_id",
  as: "answers",
});
ExamAnswer.belongsTo(ExamQuestion, {
  foreignKey: "question_id",
  as: "question",
});

// ExamQuestion → ExamUserAnswer
ExamQuestion.hasMany(ExamUserAnswer, {
  foreignKey: "question_id",
  as: "userAnswers",
});
ExamUserAnswer.belongsTo(ExamQuestion, {
  foreignKey: "question_id",
  as: "question",
});

// ExamAnswer → ExamUserAnswer
ExamAnswer.hasMany(ExamUserAnswer, {
  foreignKey: "answer_option_id",
  as: "userAnswers",
});
ExamUserAnswer.belongsTo(ExamAnswer, {
  foreignKey: "answer_option_id",
  as: "answer_option",
});

// User → ExamUserAnswer
User.hasMany(ExamUserAnswer, {
  foreignKey: "user_id",
  as: "courseUserAnswers",
});
ExamUserAnswer.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// User ↔ UserCourseAssignment
User.hasMany(UserCourseAssignment, {
  foreignKey: "user_id",
  as: "courseAssignments",
});
UserCourseAssignment.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Course ↔ UserCourseAssignment
Course.hasMany(UserCourseAssignment, {
  foreignKey: "course_id",
  as: "userAssignments",
});
UserCourseAssignment.belongsTo(Course, {
  foreignKey: "course_id",
  as: "course",
});

// User → UserCourseProgress
User.hasMany(UserCourseProgress, {
  foreignKey: "user_id",
  as: "courseProgress",
});
UserCourseProgress.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Section → UserCourseProgress
Section.hasMany(UserCourseProgress, {
  foreignKey: "section_id",
  as: "userProgress",
});
UserCourseProgress.belongsTo(Section, {
  foreignKey: "section_id",
  as: "section",
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
  Module,
  Section,
  SectionContent,
  SectionEvidence,
  Exam,
  ExamQuestion,
  ExamAnswer,
  ExamUserAnswer,
  UserCourseProgress,
  UserCourseAssignment,
};
