#ifndef FIREBASE_HANDLER_H
#define FIREBASE_HANDLER_H

#include <Arduino.h>

String getValue(String path, String caller);
void updateValue(String path, String payload, String successMessage, String failureMessage);
void addValue(String path, String payload, String caller);

#endif