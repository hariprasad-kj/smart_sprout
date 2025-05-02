#include <Arduino.h>
#include "telegram_handler.h"
#include "constants.h"

void checkAndReboot(unsigned long lastRebootTime) {
  if (millis() - lastRebootTime >= REBOOT_INTERVAL) {
    log("Rebooting...");
    ESP.restart();
  }
  if (ESP.getFreeHeap() < 20000) {
    log("Low heap, rebooting...");
    ESP.restart();
  }
}