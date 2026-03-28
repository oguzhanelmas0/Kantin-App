; Custom NSIS installer script for Windows 7 compatibility
; Installs Visual C++ 2015-2022 Redistributable (x86) before the app

!macro customInstall
  ; Visual C++ 2015-2022 Redistributable (x86) - Windows 7 için gerekli
  DetailPrint "Visual C++ bileşenleri yükleniyor..."
  File "${BUILD_RESOURCES_DIR}\vc_redist.x86.exe"
  ExecWait '"$INSTDIR\vc_redist.x86.exe" /install /quiet /norestart'
  Delete "$INSTDIR\vc_redist.x86.exe"
!macroend
