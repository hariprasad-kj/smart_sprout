#include <Arduino.h>
#include "date_handler.h"

String getTimeString()
{
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo))
        return "";
    char buffer[9];
    strftime(buffer, sizeof(buffer), "%H:%M:%S", &timeinfo);
    return String(buffer);
}

String getDateString()
{
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo))
        return "";
    char buffer[11];
    strftime(buffer, sizeof(buffer), "%d-%m-%Y", &timeinfo);
    return String(buffer);
}
