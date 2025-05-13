#ifndef MOTOR_HANDLER_H
#define MOTOR_HANDLER_H

#include <Arduino.h>

String fetchStatus();
void setMotorState(const String &state);
void readAndUpdateMotorStatus();
void scheduledTurnOn(String autoTurnOnTime, boolean isAutoTurnOnEnabled);
void sendLogToFirebase(String date, String on, String off);
void autoTurnOff(int autoTurnOffTime);
void turnStatusOffInFirebase();
int readAutoTurnOffTime();
String readAutoTurnOnTime();
boolean readAutoTurnOnEnabled();
void turnStatusOnInFirebase();
void createDateLogInFirebase();
void updateDateLogInFirebase();

#endif