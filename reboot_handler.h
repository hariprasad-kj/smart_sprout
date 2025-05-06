#ifndef REBOOT_HANDLER_H
#define REBOOT_HANDLER_H

void checkAndReboot(unsigned long lastRebootTime);
void triggerRebootIfRequired();
void resetRebootFlag();
const char* fetchForceReboot();
void sendHealthStatus();
int readHealthCheckDelay();

#endif