#include <Arduino.h>
#include <HttpClient.h>
#include <WiFi.h>
#include "telegram_handler.h"
#include "reboot_handler.h"
#include "constants.h"
#include "config.h"

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

void triggerRebootIfRequired() {
  const char* otaUpdateNeeded = fetchForceReboot();
  if (strcmp(otaUpdateNeeded, "YES") == 0) {
    log("🚀 system reboot triggered via Firebase!");
    resetRebootFlag();
    ESP.restart();
  }
}

const char* fetchForceReboot() {
  HTTPClient http;
  http.begin(String(FIREBASE_URL) + FIREBASE_FORCE_REBOOT_PATH);
  int httpCode = http.GET();
  static String result = "";  // Static to persist after the function returns

  if (httpCode == 200) {
    result = http.getString();
    result.trim();
    result.replace("\"", "");
  }

  http.end();
  return result.c_str();  // Return C-string (const char*)
}

void resetRebootFlag() {
  HTTPClient http;
  String url = String(FIREBASE_URL) + "/forceReboot.json?auth=" + String(FIREBASE_AUTH);
  String payload = "\"NO\"";  // Send the string "NO"

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.PUT(payload);
  if (httpCode == 200) {
    log("✅ Reboot flag set to NO.");
  } else {
    log("⚠️ Failed to reset Reboot flag. HTTP code: " + String(httpCode));
  }
  http.end();
}

void sendHealthStatus() {
  char payload[256];
  String url = String(FIREBASE_URL) + "/health/device_health.json?auth=" + String(FIREBASE_AUTH);

  int freeHeap = ESP.getFreeHeap();
  int rssi = WiFi.RSSI();
  int cpuFreq = ESP.getCpuFreqMHz();
  unsigned long timestamp = millis();  // if you want UTC epoch, get time_t from getLocalTime()

  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
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

  int httpCode = http.POST((uint8_t*)payload, strlen(payload));
  Serial.printf("HTTP Response: %d\n", httpCode);
  http.end();
}


int readHealthCheckDelay() {
  HTTPClient http;
  String url = String(FIREBASE_URL) + FIREBASE_HEALTH_CHECK_TIME_PATH;
  
  Serial.printf("Requesting health check delay from: %s\n", url.c_str());

  http.begin(url);
  int httpCode = http.GET();
  int value = 0;

  if (httpCode == 200) {
    String result = http.getString();
    result.trim();
    result.replace("\"", "");

    if (result.length() > 0) {
      value = result.toInt();
    } else {
      Serial.println("Warning: Empty result received for delay.");
    }
  } else {
    Serial.printf("HTTP Error %d when fetching delay.\n", httpCode);
  }

  http.end();
  return value;
}
