#!/bin/bash

sudo_pid=$(ps aux | grep 'sudo node rocket_dodge_main.js' | awk '{if ($11 == "sudo"){print $2}}')
sudo kill -9 "$sudo_pid"

main_pid=$(ps aux | grep 'node rocket_dodge_main.js' | awk '{if ($11 == "node"){print $2}}')
sudo kill -9 "$main_pid"

