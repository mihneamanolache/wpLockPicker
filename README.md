# wpLockPicker: Bruteforce Your Way Into WordPress

![No-Users](https://user-images.githubusercontent.com/43548656/182366821-36bc08ac-c3e3-4de7-9ec9-f283ae057cd2.gif)

**wpLockPicker** is a CLI tool used for bruteforcing WordPress by exploiting the XMLRPC interfaces. It is designed for academic and research pruposes and the curreent version does not take advantage of the `system.multicall()` method that hackers usually use in order to send multiple calls without a big impact on the network.

## Installing wpLockPicker
**wpLockPicker** is built with node `16.15.1`. Make sure you have it installed on your machine before. You can check which version of node you have on your machine by typing `node -v` in your terminal.

To install **wpLockPicker** simply clone this repo locally:
```
git clone git@github.com:mihneamanolache/wpLockPicker.git
```

## Running wpLockPicker
In order to run **wpLockPicker**, navigate to it's direcotory ( `cd wpLockPicker` ) and type `node wpLockPicker --url='<YOUR_TARGET_URL>'`. **wpLockPicker** uses a pass.txt file by default, however you may specify the path to a different wordlist by using the `--pass` argument. Also, if your target is not using SSL, you may add the `--http` switch.



## Disclaimer
The tool is not inteded for illegal purposes ( hence its single pass per thread approach ). You can use the tool on websites that you own or if you have the owner's approval. Do not attempt to illegaly use this tool on any website!