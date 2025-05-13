#include <Arduino.h>
#include <HTTPClient.h>
#include <time.h>
#include "constants.h"
#include "config.h"
#include "telegram_handler.h"
#include "motor_handler.h"
#include "firebase_handler.h"
#include "date_handler.h"

String lastStatus = "";
boolean motorRunning = "";
unsigned long motorStartTime = 0;
String onTime = "";
String date = "";
String offTime = "";

String fetchStatus()
{
  return getValue(String(FIREBASE_URL) + FIREBASE_STATUS_PATH, "fetchStatus() in motor_handler.h");
}

void setMotorState(const String &state)
{
  int pinState = (state.equalsIgnoreCase("ON")) ? LOW : HIGH;
  motorRunning = state.equalsIgnoreCase("ON");
  digitalWrite(MOTOR_LINE_A, pinState);
  digitalWrite(MOTOR_LINE_B, pinState);
  if (motorRunning)
  {
    motorStartTime = millis();
  }
  else
  {
    motorStartTime = 0;
  }
}

void autoTurnOff(int autoTurnOffTime)
{
  if (millis() - motorStartTime >= autoTurnOffTime)
  {
    turnStatusOffInFirebase();
    readAndUpdateMotorStatus();
  }
}

void readAndUpdateMotorStatus()
{
  String currentStatus = fetchStatus();
  if (currentStatus != "" && currentStatus != lastStatus)
  {
    lastStatus = currentStatus;
    setMotorState(currentStatus);
    if (currentStatus == "ON")
    {
      createDateLogInFirebase();
    }
    else
    {
      updateDateLogInFirebase();
    }
    log("➡️ Polled: " + currentStatus);
  }
}

void scheduledTurnOn(String autoTurnOnTime, boolean isAutoTurnOnEnabled)
{
  String currentStatus = fetchStatus();
  if (currentStatus != "ON" && isAutoTurnOnEnabled)
  {
    struct tm timeinfo;
    if (getLocalTime(&timeinfo))
    {
      char currentTime[6];
      strftime(currentTime, sizeof(currentTime), "%H:%M", &timeinfo);
      if (String(currentTime) == autoTurnOnTime)
      {
        turnStatusOnInFirebase();
        log("auto turn on enabled for " + autoTurnOnTime + " , turning on...");
      }
    }
  }
}

void turnStatusOnInFirebase()
{
  if (!motorRunning)
  {
    String url = String(FIREBASE_URL) + "/status.json?auth=" + String(FIREBASE_AUTH);
    updateValue(url, "\"ON\"", "✅ motor status set to ON.", "⚠️ Failed to set motor status to ON.");
  }
}

void turnStatusOffInFirebase()
{
  if (motorRunning)
  {
    String url = String(FIREBASE_URL) + "/status.json?auth=" + String(FIREBASE_AUTH);
    updateValue(url, "\"OFF\"", "✅ motor status set to OFF.", "⚠️ Failed to set motor status to OFF.");
  }
}

int readAutoTurnOffTime()
{
  String autoturnofftime = getValue(String(FIREBASE_URL) + FIREBASE_AUTO_TURN_OFF_TIME_PATH, "readAutoTurnOffTime() in motor_handler");
  if (autoturnofftime.isEmpty())
  {
    return 0;
  }

  return autoturnofftime.toInt();
}

String readAutoTurnOnTime()
{
  return getValue(String(FIREBASE_URL) + FIREBASE_AUTO_TURN_ON_TIME_PATH, "readAutoTurnOnTime() in motor_handler");
}

boolean readAutoTurnOnEnabled()
{
  return getValue(String(FIREBASE_URL) + FIREBASE_AUTO_TURN_ON_ENABLED_PATH, "readAutoTurnOnEnabled() in motor_handler");
}

void sendLogToFirebase(String date, String on, String off)
{
  String url = String(FIREBASE_URL) + "/logs/" + date + ".json";
  String payload = "{\"on\":\"" + on + "\",\"off\":\"" + off + "\"}";
  if (date && date.length() > 0 && on && on.length() > 0) {
    addValue(url, payload, "sendLogToFirebase() in motor_handler.cpp");
  }
}

void createDateLogInFirebase()
{
  onTime = getTimeString();
  date = getDateString();
}

void updateDateLogInFirebase()
{
  offTime = getTimeString();
  sendLogToFirebase(date, onTime, offTime);
}