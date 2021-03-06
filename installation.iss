; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{D112BAFD-3B1E-41AB-BF01-AED486EC682A}
AppName=TorrentPlay
AppVersion=1.0
;AppVerName=TorrentPlay 1.0
AppPublisher=CLDev
AppPublisherURL=https://github.com/crlorenzo7/TorrentPlay
AppSupportURL=https://github.com/crlorenzo7/TorrentPlay
AppUpdatesURL=https://github.com/crlorenzo7/TorrentPlay
DefaultDirName={pf}\TorrentPlay
DisableProgramGroupPage=yes
LicenseFile=D:\Descargas\license.txt
OutputDir=C:\Users\c_lor\Documents\aplicaciones\MovieFinder2
OutputBaseFilename=TorrentPlay
SetupIconFile=C:\Users\c_lor\Documents\aplicaciones\MovieFinder2\nwuser2\favicon.ico
Compression=lzma
SolidCompression=yes

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "C:\Users\c_lor\Documents\aplicaciones\MovieFinder2\TorrentPlay-win32-x64\TorrentPlay.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\Users\c_lor\Documents\aplicaciones\MovieFinder2\TorrentPlay-win32-x64\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{commonprograms}\TorrentPlay"; Filename: "{app}\TorrentPlay.exe"
Name: "{commondesktop}\TorrentPlay"; Filename: "{app}\TorrentPlay.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\TorrentPlay.exe"; Description: "{cm:LaunchProgram,TorrentPlay}"; Flags: nowait postinstall skipifsilent

