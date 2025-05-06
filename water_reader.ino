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

boolean startUpMotorState = true;
float tankHeight = 0;
unsigned long lastHealthCheck = 0;
unsigned long lastSensorRead = 0;
unsigned long lastRebootTime = 0;
int autoTurnOffTime = 0;
int healthCheckDelay = 0;

void setup() {
  lastRebootTime = millis();
  Serial.begin(115200);
  setupPins();
  completeSetup();
  log("✅ Setup complete");
  Serial.println("✅ Setup complete");
  tankHeight = readTankHeight();
  autoTurnOffTime = readAutoTurnOffTime() * 1000UL;
  healthCheckDelay = readHealthCheckDelay() * 1000UL;
}

void loop() {
  unsigned long now = millis();

  // Send health every HEALTH_INTERVAL
  if (now - lastHealthCheck >= healthCheckDelay) {
    lastHealthCheck = now;
    log("sending health data..");
    sendHealthStatus();
  }

  // Read sensor every SENSOR_INTERVAL
  if (now - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = now;
    readSensor(tankHeight);
  }

  triggerRebootIfRequired();
  checkOtaUpdateRequired();
  readAndUpdateMotorStatus(startUpMotorState);
  autoTurnOff(autoTurnOffTime);
  startUpMotorState = false;
  checkAndReboot(lastRebootTime);
}



