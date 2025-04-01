@echo off
mkdir png-resizer-electron
cd png-resizer-electron
mkdir electron
mkdir electron\handlers
mkdir src
mkdir src\components
mkdir src\styles
mkdir public
echo [ResizeConfigure]> config.ini
echo target_dir = M:/Naotallow/00.Illustration/>> config.ini
echo.>> config.ini
echo [SaiSync]>> config.ini
echo src_dir = ./22.test_sai/>> config.ini
echo dst_dir = M:/Naotallow/00.Illustration/_sai_test/>> config.ini
echo Done!
pause