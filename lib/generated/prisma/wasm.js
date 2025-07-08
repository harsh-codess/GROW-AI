
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  bio: 'bio',
  email: 'email',
  password: 'password',
  emailVerified: 'emailVerified',
  image: 'image',
  role: 'role',
  companyId: 'companyId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  credits: 'credits'
};

exports.Prisma.LeadScalarFieldEnum = {
  id: 'id',
  email: 'email',
  name: 'name',
  data: 'data',
  campaignId: 'campaignId',
  status: 'status',
  sentAt: 'sentAt',
  emailContent: 'emailContent',
  subject: 'subject',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.CompanyScalarFieldEnum = {
  id: 'id',
  name: 'name',
  website: 'website',
  industry: 'industry',
  size: 'size',
  fundingStage: 'fundingStage',
  logo: 'logo',
  primaryColor: 'primaryColor',
  missionStatement: 'missionStatement',
  targetAudience: 'targetAudience',
  description: 'description',
  vectorStoreId: 'vectorStoreId',
  onboardingCompleted: 'onboardingCompleted',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContentItemScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  type: 'type',
  platform: 'platform',
  title: 'title',
  content: 'content',
  rawContent: 'rawContent',
  imageUrl: 'imageUrl',
  status: 'status',
  publishDate: 'publishDate',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VoiceAgentScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  name: 'name',
  phoneNumber: 'phoneNumber',
  voiceId: 'voiceId',
  active: 'active',
  scriptId: 'scriptId',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ScriptScalarFieldEnum = {
  id: 'id',
  name: 'name',
  greeting: 'greeting',
  faq: 'faq',
  fallback: 'fallback',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CallScalarFieldEnum = {
  id: 'id',
  agentId: 'agentId',
  callerNumber: 'callerNumber',
  duration: 'duration',
  recordingUrl: 'recordingUrl',
  transcriptUrl: 'transcriptUrl',
  summary: 'summary',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.ProductPhotographySessionScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  productType: 'productType',
  style: 'style',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductImageScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  companyId: 'companyId',
  originalUrl: 'originalUrl',
  generatedUrls: 'generatedUrls',
  style: 'style',
  background: 'background',
  prompt: 'prompt',
  status: 'status',
  isSelected: 'isSelected',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductVideoSessionScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  productType: 'productType',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductVideoScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  companyId: 'companyId',
  originalImageUrl: 'originalImageUrl',
  generatedImageUrls: 'generatedImageUrls',
  videoUrl: 'videoUrl',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DocumentProcessingJobScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  userId: 'userId',
  filePath: 'filePath',
  fileName: 'fileName',
  fileType: 'fileType',
  status: 'status',
  error: 'error',
  vectorStoreId: 'vectorStoreId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DocumentChunkScalarFieldEnum = {
  id: 'id',
  documentId: 'documentId',
  content: 'content',
  embedding: 'embedding',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  name: 'name',
  fileUrl: 'fileUrl',
  fileType: 'fileType',
  content: 'content',
  status: 'status',
  vectorStoreId: 'vectorStoreId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ActivityLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  companyId: 'companyId',
  activityType: 'activityType',
  description: 'description',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.AnalyticsEventScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  companyId: 'companyId',
  eventType: 'eventType',
  eventData: 'eventData',
  createdAt: 'createdAt'
};

exports.Prisma.ChatConversationScalarFieldEnum = {
  id: 'id',
  title: 'title',
  userId: 'userId',
  companyId: 'companyId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ChatMessageScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  userId: 'userId',
  role: 'role',
  content: 'content',
  createdAt: 'createdAt'
};

exports.Prisma.SocialConnectionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  platform: 'platform',
  platformUserId: 'platformUserId',
  platformUsername: 'platformUsername',
  isEnabled: 'isEnabled',
  isVerified: 'isVerified',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  tokenType: 'tokenType',
  tokenExpiry: 'tokenExpiry',
  scope: 'scope',
  accountType: 'accountType',
  lastFetch: 'lastFetch',
  lastAnalyticsFetch: 'lastAnalyticsFetch',
  lastDemographicsFetch: 'lastDemographicsFetch',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AnalyticsDataScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  platform: 'platform',
  dataType: 'dataType',
  data: 'data',
  expiry: 'expiry',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.AssistantScalarFieldEnum = {
  id: 'id',
  name: 'name',
  goal: 'goal',
  companyName: 'companyName',
  speakFirst: 'speakFirst',
  systemPrompt: 'systemPrompt',
  model: 'model',
  voice: 'voice',
  language: 'language',
  temprature: 'temprature',
  maxCallDuration: 'maxCallDuration',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IncomingCallConfigScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  assistantId: 'assistantId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PhoneNumberScalarFieldEnum = {
  id: 'id',
  number: 'number',
  sid: 'sid',
  authToken: 'authToken',
  name: 'name',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContactScalarFieldEnum = {
  id: 'id',
  name: 'name',
  phoneNumber: 'phoneNumber',
  email: 'email',
  context: 'context',
  contactListId: 'contactListId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContactListScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CampaignScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  assistantId: 'assistantId',
  numberId: 'numberId',
  userId: 'userId',
  contactListId: 'contactListId',
  type: 'type',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  maxAttempts: 'maxAttempts',
  callsPerDay: 'callsPerDay',
  scheduleStart: 'scheduleStart',
  scheduleEnd: 'scheduleEnd',
  timezone: 'timezone',
  maxCallsPerDay: 'maxCallsPerDay',
  currentDayCallCount: 'currentDayCallCount',
  lastCallDate: 'lastCallDate',
  startTime: 'startTime',
  endTime: 'endTime',
  totalContacts: 'totalContacts',
  completedContacts: 'completedContacts',
  failedContacts: 'failedContacts',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CampaignLogScalarFieldEnum = {
  id: 'id',
  campaignId: 'campaignId',
  message: 'message',
  level: 'level',
  timestamp: 'timestamp'
};

exports.Prisma.CallHistoryScalarFieldEnum = {
  id: 'id',
  assistantName: 'assistantName',
  campaignName: 'campaignName',
  customerName: 'customerName',
  customerNumber: 'customerNumber',
  callAnswered: 'callAnswered',
  callStartedAt: 'callStartedAt',
  callEndedAt: 'callEndedAt',
  callDuration: 'callDuration',
  callSummary: 'callSummary',
  transcript: 'transcript',
  callSid: 'callSid',
  ultravoxCallId: 'ultravoxCallId',
  shortSummary: 'shortSummary',
  metrics: 'metrics',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId'
};

exports.Prisma.KnowledgeBaseScalarFieldEnum = {
  id: 'id',
  name: 'name',
  content: 'content',
  assistantId: 'assistantId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmailCampaignScalarFieldEnum = {
  id: 'id',
  name: 'name',
  tone: 'tone',
  emailType: 'emailType',
  context: 'context',
  status: 'status',
  userId: 'userId',
  stats: 'stats',
  totalEmails: 'totalEmails',
  successful: 'successful',
  failed: 'failed',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmailLeadScalarFieldEnum = {
  id: 'id',
  email: 'email',
  name: 'name',
  data: 'data',
  campaignId: 'campaignId',
  status: 'status',
  sentAt: 'sentAt',
  emailContent: 'emailContent',
  subject: 'subject',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BusinessPlanScalarFieldEnum = {
  id: 'id',
  name: 'name',
  companyId: 'companyId',
  userId: 'userId',
  planData: 'planData',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PlanMilestoneScalarFieldEnum = {
  id: 'id',
  businessPlanId: 'businessPlanId',
  title: 'title',
  description: 'description',
  timeframe: 'timeframe',
  category: 'category',
  status: 'status',
  progress: 'progress',
  resources: 'resources',
  metrics: 'metrics',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PlanTaskScalarFieldEnum = {
  id: 'id',
  milestoneId: 'milestoneId',
  description: 'description',
  status: 'status',
  dueDate: 'dueDate',
  assignedTo: 'assignedTo',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

exports.speakFirstType = exports.$Enums.speakFirstType = {
  CLIENT: 'CLIENT',
  AGENT: 'AGENT'
};

exports.CampaignType = exports.$Enums.CampaignType = {
  OUTBOUND_CALLS: 'OUTBOUND_CALLS',
  SMS: 'SMS',
  MIXED: 'MIXED'
};

exports.CampaignStatus = exports.$Enums.CampaignStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  PAUSED: 'PAUSED',
  FAILED: 'FAILED'
};

exports.Prisma.ModelName = {
  User: 'User',
  Lead: 'Lead',
  Session: 'Session',
  Company: 'Company',
  ContentItem: 'ContentItem',
  VoiceAgent: 'VoiceAgent',
  Script: 'Script',
  Call: 'Call',
  ProductPhotographySession: 'ProductPhotographySession',
  ProductImage: 'ProductImage',
  ProductVideoSession: 'ProductVideoSession',
  ProductVideo: 'ProductVideo',
  DocumentProcessingJob: 'DocumentProcessingJob',
  DocumentChunk: 'DocumentChunk',
  Document: 'Document',
  ActivityLog: 'ActivityLog',
  AnalyticsEvent: 'AnalyticsEvent',
  ChatConversation: 'ChatConversation',
  ChatMessage: 'ChatMessage',
  SocialConnection: 'SocialConnection',
  AnalyticsData: 'AnalyticsData',
  Account: 'Account',
  VerificationToken: 'VerificationToken',
  Assistant: 'Assistant',
  IncomingCallConfig: 'IncomingCallConfig',
  PhoneNumber: 'PhoneNumber',
  contact: 'contact',
  contactList: 'contactList',
  Campaign: 'Campaign',
  CampaignLog: 'CampaignLog',
  CallHistory: 'CallHistory',
  KnowledgeBase: 'KnowledgeBase',
  EmailCampaign: 'EmailCampaign',
  EmailLead: 'EmailLead',
  BusinessPlan: 'BusinessPlan',
  PlanMilestone: 'PlanMilestone',
  PlanTask: 'PlanTask'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
