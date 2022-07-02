var shell = WScript.CreateObject("WScript.Shell");
shell.Popup("Возникла критическая ошибка. Приложение будет остановлено.\r\nТекст: Нельзя обижать Темми!\r\nКод: ERR_CRASH", 0, "Критическая ошибка", 0+16);
shell.Run("taskkill /f /im mshta.exe", 0);