#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <WiFiClient.h>
#include <Update.h>
#include "config.h"
#include "telegram_handler.h"
#include "firebase_handler.h"

void performOTA()
{
  WiFiClientSecure client;
  client.setInsecure(); // Accept all certificates (for testing)

  HTTPClient https;

  if (https.begin(client, String(FIRMWARE_URL)))
  {
    int httpCode = https.GET();
    if (httpCode == HTTP_CODE_OK)
    {
      int len = https.getSize();
      if (len <= 0)
      {
        Serial.println("Content-Length not available.");
        https.end();
        return;
      }

      bool canBegin = Update.begin(len);
      if (!canBegin)
      {
        Serial.println("Not enough space for OTA");
        https.end();
        return;
      }

      WiFiClient *stream = https.getStreamPtr();
      size_t written = 0;
      uint8_t buff[128] = {0};

      while (https.connected() && len > 0)
      {
        size_t availableSize = stream->available();
        if (availableSize)
        {
          int readSize = stream->readBytes(buff, ((availableSize > sizeof(buff)) ? sizeof(buff) : availableSize));
          if (readSize > 0)
          {
            written = Update.write(buff, readSize);
            if (written != readSize)
            {
              Serial.println("Write failed!");
              https.end();
              return;
            }
            len -= readSize;
          }
        }
        delay(1);
      }

      if (Update.end())
      {
        if (Update.isFinished())
        {
          Serial.println("OTA update successful!");
        }
        else
        {
          Serial.println("OTA update not finished.");
        }
      }
      else
      {
        Serial.println("Error Occurred. Error #: " + String(Update.getError()));
      }
    }
    else
    {
      Serial.println("Failed to connect, HTTP code: " + String(httpCode));
    }
    https.end();
  }
  else
  {
    Serial.println("HTTPS unable to begin");
  }
}

void resetOTAFlag()
{
  String url = String(FIREBASE_URL) + "/otaUpdate.json?auth=" + String(FIREBASE_AUTH);
  String payload = "\"NO\""; // Send the string "NO"
  updateValue(url, payload, "✅ OTA flag reset to no.", "⚠️ Failed to reset OTA flag.");
}

String fetchOtaUpdate()
{
  return getValue(String(FIREBASE_URL) + FIREBASE_UPDATE_FLAG_PATH, "fetchOtaUpdate() in ota_handler.h");
}

void checkOtaUpdateRequired()
{
  String otaUpdateNeeded = fetchOtaUpdate();
  if (otaUpdateNeeded == "YES")
  {
    log("🚀 OTA update triggered via Firebase!");
    performOTA();
    resetOTAFlag();
    ESP.restart();
  }
}