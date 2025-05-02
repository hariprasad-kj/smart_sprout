#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Update.h>
#include "constants.h"
#include "config.h"
#include "telegram_handler.h"
#include "ota_handler.h"
#include "motor_handler.h"
#include "sensor_reader.h"
#include "reboot_handler.h"

unsigned long lastRebootTime = 0;

void setup() {
  lastRebootTime = millis();
  Serial.begin(115200);
  setupPins();
  completeSetup();
  log("✅ Setup complete");
}

void loop() {
  checkOtaUpdateRequired();
  readAndUpdateMotorStatus();
  checkAndReboot(lastRebootTime);
  readSensor();
  delay(20000);  // Longer delay before the next set of readings to prevent rapid output
}
