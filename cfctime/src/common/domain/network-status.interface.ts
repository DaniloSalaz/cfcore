export interface INetworkStatusService {
  isOnline(): boolean;
  onStatusChange(callback: (online: boolean) => void): void;
}
