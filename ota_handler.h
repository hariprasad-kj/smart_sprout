#ifndef OTA_HANDLER_H
#define OTA_HANDLER_H

void performOTA();
void resetOTAFlag();
String fetchOtaUpdate();
void checkOtaUpdateRequired();

#endif