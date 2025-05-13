#include "constants.h"
#include "config.h"
#include "telegram_handler.h"
#include "ota_handler.h"
#include "motor_handler.h"
#include "sensor_reader.h"
#include "reboot_handler.h"

float tankHeight = 0;
unsigned long lastHealthCheck = 0;
unsigned long lastSensorRead = 0;
unsigned long lastRebootTime = 0;
unsigned long lastOtaCheck = 0;
unsigned long lastForceRebootCheck = 0;
int autoTurnOffTime = 0;
int healthCheckDelay = 0;
String autoTurnOnTime = "";
boolean isAutoTurnOnEnabled = false;

void setup()
{
  lastRebootTime = millis();
  Serial.begin(115200);
  setupPins();
  completeSetup();
  tankHeight = readTankHeight();
  autoTurnOffTime = readAutoTurnOffTime() * 1000UL;
  healthCheckDelay = readHealthCheckDelay() * 1000UL;
  autoTurnOnTime = readAutoTurnOnTime();
  isAutoTurnOnEnabled = readAutoTurnOnEnabled();
  sendHealthStatus();
  log("✅ Setup complete");
}

void loop()
{
  unsigned long now = millis();

  // Send health every HEALTH_INTERVAL
  if (now - lastHealthCheck >= healthCheckDelay)
  {
    lastHealthCheck = now;
    log("sending health data..");
    sendHealthStatus();
  }

  // Read sensor every SENSOR_INTERVAL
  if (now - lastSensorRead >= SENSOR_INTERVAL)
  {
    lastSensorRead = now;
    readSensor(tankHeight);
  }

  if (now - lastOtaCheck >= OTA_CHECK_INTERVAL) {
    lastOtaCheck = now;
    checkOtaUpdateRequired();
  }

  if (now - lastForceRebootCheck >= FORCE_REBOOT_CHECK_INTERVAL) {
    lastForceRebootCheck = now;
  }
  triggerRebootIfRequired();

  checkAndReboot(lastRebootTime);
  readAndUpdateMotorStatus();
  scheduledTurnOn(autoTurnOnTime, isAutoTurnOnEnabled);
  autoTurnOff(autoTurnOffTime);
}
