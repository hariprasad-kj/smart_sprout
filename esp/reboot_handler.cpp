#include <Arduino.h>
#include <HttpClient.h>
#include <WiFi.h>
#include "telegram_handler.h"
#include "reboot_handler.h"
#include "constants.h"
#include "config.h"
#include "firebase_handler.h"

void checkAndReboot(unsigned long lastRebootTime)
{
  if (millis() - lastRebootTime >= REBOOT_INTERVAL)
  {
    log("Rebooting...");
    ESP.restart();
  }
  if (ESP.getFreeHeap() < 20000)
  {
    log("Low heap, rebooting...");
    ESP.restart();
  }
}

void triggerRebootIfRequired()
{
  String otaUpdateNeeded = fetchForceReboot();
  if (otaUpdateNeeded == "YES")
  {
    log("🚀 system reboot triggered via Firebase!");
    resetRebootFlag();
    ESP.restart();
  }
}

String fetchForceReboot()
{
  String forceRebootValue = getValue(String(FIREBASE_URL) + FIREBASE_FORCE_REBOOT_PATH, "fetchForceReboot() in reboot_handler.h");
  // Check if the value is empty or invalid
  if (forceRebootValue.isEmpty())
  {
    return "NO"; // Return a default value if invalid or empty
  }

  return forceRebootValue;
}

void resetRebootFlag()
{
  String url = String(FIREBASE_URL) + "/forceReboot.json?auth=" + String(FIREBASE_AUTH);
  String payload = "\"NO\""; // Send the string "NO"
  updateValue(url, payload, "✅ Reboot flag set to NO.", "⚠️ Failed to reset Reboot flag.");
}

void sendHealthStatus()
{

  char payload[256];
  String url = String(FIREBASE_URL) + "/health/device_health.json?auth=" + String(FIREBASE_AUTH);

  int freeHeap = ESP.getFreeHeap();
  int rssi = WiFi.RSSI();
  int cpuFreq = ESP.getCpuFreqMHz();
  unsigned long timestamp = millis(); // if you want UTC epoch, get time_t from getLocalTime()

  struct tm timeinfo;
  if (!getLocalTime(&timeinfo))
  {
    Serial.println("⚠️ Failed to obtain time");
    return;
  }

  char timeString[30];
  strftime(timeString, sizeof(timeString), "%Y-%m-%d %H:%M:%S", &timeinfo);

  // Construct JSON with timestamp as string
  snprintf(payload, sizeof(payload),
           "{\"freeHeap\":%d,\"wifiRSSI\":%d,\"cpuFreqMHz\":%d,\"timestamp\":\"%s\"}",
           freeHeap, rssi, cpuFreq, timeString);

  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST((uint8_t *)payload, strlen(payload));
  Serial.printf("HTTP Response: %d\n", httpCode);
  http.end();
}

int readHealthCheckDelay()
{
  String url = String(FIREBASE_URL) + FIREBASE_HEALTH_CHECK_TIME_PATH;
  String healthCheckDelay = getValue(url, "readHealthCheckDelay() in reboot_handler.cpp");

  // Check if the value is empty or invalid
  if (healthCheckDelay.isEmpty())
  {
    return 0;
  }

  return healthCheckDelay.toInt();
}
