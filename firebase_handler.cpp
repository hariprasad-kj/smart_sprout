#include "firebase_handler.h"
#include <Arduino.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include "telegram_handler.h"

WiFiClientSecure secureClient;

String getValue(String path, String caller)
{
    Serial.println("inside getValue(), caller: " + caller);
    secureClient.setInsecure();
    HTTPClient http;
    http.begin(secureClient, path);
    int httpCode = http.GET();
    String result = "";

    if (httpCode == 200)
    {
        result = http.getString();
        result.trim();
        result.replace("\"", "");
    }

    http.end();
    return result;
}

void updateValue(String path, String payload, String successMessage, String failureMessage)
{
    Serial.println("inside updateValue()");
    secureClient.setInsecure();
    HTTPClient http;

    http.begin(secureClient, path);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.PUT(payload);
    if (httpCode == 200)
    {
        log(successMessage);
    }
    else
    {
        log(failureMessage + ". HTTP code: " + String(httpCode));
    }
    http.end();
}

void addValue(String path, String payload, String caller)
{
    Serial.println("inside addValue(), caller: " + caller);
    secureClient.setInsecure();
    HTTPClient http;
    http.begin(secureClient, path);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.sendRequest("POST", payload);
    http.end();
}