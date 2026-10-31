// 1. Defined Interface (No 'any' allowed!)
export interface ConsumptionLog {
  cityId: string;
  cityName: string;
  contact: string;
  createdAt: string;
  createdById: string;
  createdByName: string;
  deletedAt: string | null;
  email: string;
  id: string;
  identity: string;
  name: string;
  note: string;
  outerIdentity: string | null;
  password: string;
  phone: string;
  serviceAreaId: string | null;
  street: string;
}
export interface BandwidthUsage {
  up: number;
  down: number;
}

export interface BandwidthData {
  clientId: number;
  createdAt: string; // ISO date string
  id: number;
  subjectHour: string; // ISO date string
  terminalNodeId: number;

  jsonData: {
    [hour: string]: BandwidthUsage;
  };
}

export interface ChartPoint {
  time: string;
  up: number;
  down: number;
}

export interface ChartData {
  day: string;
  up: number;
  down: number;
}
export interface DailyConsumption {
  fiberVuId: number;
  clientName: string;
  consumptionDay: string;
  createdAt: string;
  down: string;
  id: number;
  terminalNodeId: number;
  up: string;
}

export interface ConsumptionGroupedByClient {
  clientId: number;
  data: DailyConsumption[];
}

export interface SavedConsumptionResponse {
  message: string;
  sync: {
    id: number;
    startDate: string;
    endDate: string;
    pulledAt: string;
  };
  totalClients: number;
  totalRecords: number;
  results: ConsumptionGroupedByClient[];
}
export interface ConsumptionItem {
  consumptionDay: string;
  up: string;
  down: string;
}

export interface TerminalNode {
  cityId: number;
  cityName: string | null;
  clientId: number;
  clientIdentifier: string | null;
  clientName: string | null;
  clientOuterIdentifier: string;
  comment: string | null;
  contact: string | null;
  contract: string | null;
  createdAt: string;
  createdById: number | null;
  createdByName: string | null;
  customVlanTaggingIptvId: number | null;
  customVlanTaggingNetId: number | null;
  deletedAt: string | null;
  deletedById: number | null;
  email: string | null;
  fixIp: string | null;
  hookedAt: string;
  hookedById: number | null;
  hookedByName: string | null;
  id: number;
  fiberVuId: number;
  isFtth: boolean | null;
  isPppoe: boolean | null;
  isPppoeActive: boolean | null;
  language: string | null;
  mapDataId: number | null;
  mapDataName: string | null;
  modifiedAt: string;
  modifiedById: number | null;
  modifiedByName: string | null;
  name: string | null;
  number: number | null;
  numberExt: string | null;
  oltName: string | null;
  onuOltId: number | null;
  opticalDeviceId: number;
  outerIdentity: string | null;
  packageName: string | null;
  password: string | null;
  phone: string | null;
  radiusPassword: string | null;
  radiusUsername: string | null;
  rfEnabled: boolean | null;
  serialNumber: string | null;
  serviceAreaId: number | null;
  serviceAreaName: string | null;
  sipData: string | null;
  status: string | null;
  statusId: number | null;
  statusOperational: boolean;
  streetId: number | null;
  streetName: string | null;
  terminalNodeOltId: string | null;
  todoCount: number | null;
  todoTaskIds: number[] | null;
  tr069Enabled: boolean | null;
  voipProvider: string | null;
  voipProviderId: string | null;
  wifi: boolean | null;
}

export interface TerminalNodeSync {
  id: number;
  startDate: Date;
  endDate: Date;
  pulledAt: Date;
  totalRecords: number;
}
export interface RoleTypes {
  id: number;
  role: string;
  createdAt: Date;
  updatedAt: Date | null;
}
export interface UserTypes {
  id: number;
  username: string;
  email: string;
  firstname: string;
  password: string;
  lastname: string;
  suffix?: string | null;
  receiveAlarmEmail: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  roles: RoleTypes;
}
export interface EnrichedTerminalNode extends TerminalNode {
  totalUp: number;
  totalDown: number;
}
export interface AnalyticsProps {
  topUpload: EnrichedTerminalNode[];
  topDownload: EnrichedTerminalNode[];
  upload95: number;
  download95: number;
  zeroBytesUpload: EnrichedTerminalNode[];
  zeroBytesDownload: EnrichedTerminalNode[];
}

export interface ConsumptionRequestBody {
  id: number;
  terminal_node_id: string;
  created_at: string;
  clientId: number;
  consumptionDay: string; // ISO date string
  up: string;
  down: string;
}
export interface Log {
  userId: string;
  name: string;
  username: string;
  email: string;
  role: string;
  timestamp: string;
}
