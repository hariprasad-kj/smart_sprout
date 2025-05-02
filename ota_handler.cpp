#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <WiFiClient.h>
#include <Update.h>
#include "config.h"
#include "telegram_handler.h"

void performOTA() {
  WiFiClientSecure client;
  client.setInsecure();  // Accept all certificates (for testing)

  HTTPClient https;

  if (https.begin(client, String(FIRMWARE_URL))) {
    int httpCode = https.GET();
    if (httpCode == HTTP_CODE_OK) {
      int len = https.getSize();
      if (len <= 0) {
        Serial.println("Content-Length not available.");
        https.end();
        return;
      }

      bool canBegin = Update.begin(len);
      if (!canBegin) {
        Serial.println("Not enough space for OTA");
        https.end();
        return;
      }

      WiFiClient *stream = https.getStreamPtr();
      size_t written = 0;
      uint8_t buff[128] = {0};

      while (https.connected() && len > 0) {
        size_t availableSize = stream->available();
        if (availableSize) {
          int readSize = stream->readBytes(buff, ((availableSize > sizeof(buff)) ? sizeof(buff) : availableSize));
          if (readSize > 0) {
            written = Update.write(buff, readSize);
            if (written != readSize) {
              Serial.println("Write failed!");
              https.end();
              return;
            }
            len -= readSize;
          }
        }
        delay(1);
      }

      if (Update.end()) {
        if (Update.isFinished()) {
          Serial.println("OTA update successful!");
        } else {
          Serial.println("OTA update not finished.");
        }
      } else {
        Serial.println("Error Occurred. Error #: " + String(Update.getError()));
      }
    } else {
      Serial.println("Failed to connect, HTTP code: " + String(httpCode));
    }
    https.end();
  } else {
    Serial.println("HTTPS unable to begin");
  }
}

void resetOTAFlag() {
  HTTPClient http;
  String url = String(FIREBASE_URL) + "/otaUpdate.json?auth=" + String(FIREBASE_AUTH);
  String payload = "\"NO\"";  // Send the string "NO"

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.PUT(payload);
  if (httpCode == 200) {
    log("✅ OTA flag reset to no.");
  } else {
    log("⚠️ Failed to reset OTA flag. HTTP code: " + String(httpCode));
  }
  http.end();
}

const char* fetchOtaUpdate() {
  HTTPClient http;
  http.begin(String(FIREBASE_URL) + FIREBASE_UPDATE_FLAG_PATH);
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

void checkOtaUpdateRequired() {
  const char* otaUpdateNeeded = fetchOtaUpdate();
  if (strcmp(otaUpdateNeeded, "YES") == 0) {
    log("🚀 OTA update triggered via Firebase!");
    performOTA();
    resetOTAFlag();
    ESP.restart();
  }
}