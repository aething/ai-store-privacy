#!/bin/bash

# Скрипт для подготовки иконок Android из одного файла
# Исходный файл: attached_assets/AI Store Icon M.png

# Копируем главную иконку в разные размеры для Android
# mipmap-mdpi (48x48)
convert attached_assets/AI\ Store\ Icon\ M.png -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
# mipmap-hdpi (72x72)
convert attached_assets/AI\ Store\ Icon\ M.png -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
# mipmap-xhdpi (96x96)
convert attached_assets/AI\ Store\ Icon\ M.png -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
# mipmap-xxhdpi (144x144)
convert attached_assets/AI\ Store\ Icon\ M.png -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
# mipmap-xxxhdpi (192x192)
convert attached_assets/AI\ Store\ Icon\ M.png -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# Копируем круглую иконку
cp android/app/src/main/res/mipmap-mdpi/ic_launcher.png android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
cp android/app/src/main/res/mipmap-hdpi/ic_launcher.png android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
cp android/app/src/main/res/mipmap-xhdpi/ic_launcher.png android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
cp android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
cp android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

# Создаем foreground иконку (это та же иконка, но немного меньше размера)
convert attached_assets/AI\ Store\ Icon\ M.png -resize 42x42 -gravity center -background none -extent 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png
convert attached_assets/AI\ Store\ Icon\ M.png -resize 65x65 -gravity center -background none -extent 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png
convert attached_assets/AI\ Store\ Icon\ M.png -resize 86x86 -gravity center -background none -extent 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png
convert attached_assets/AI\ Store\ Icon\ M.png -resize 130x130 -gravity center -background none -extent 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png
convert attached_assets/AI\ Store\ Icon\ M.png -resize 172x172 -gravity center -background none -extent 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png

echo "Иконки успешно созданы!"
