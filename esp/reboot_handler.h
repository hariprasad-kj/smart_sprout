#ifndef REBOOT_HANDLER_H
#define REBOOT_HANDLER_H

void checkAndReboot(unsigned long lastRebootTime);
void triggerRebootIfRequired();
void resetRebootFlag();
String fetchForceReboot();
void sendHealthStatus();
int readHealthCheckDelay();

#endif