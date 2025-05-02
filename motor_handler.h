#ifndef MOTOR_HANDLER_H
#define MOTOR_HANDLER_H

#include <Arduino.h>

String fetchStatus();
void setMotorState(const String& state);
void readAndUpdateMotorStatus();

#endif