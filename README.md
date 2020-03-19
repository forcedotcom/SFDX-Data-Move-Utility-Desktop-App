# The Desktop GUI Application for the Salesforce Data Move Utility (SFDMU)

**The SFDMU (Salesforce DX Data Move Utility) Plugin** **for SFDX** will assist you to populate your org (scratch / dev / sandbox / prod) with data imported from another org. It supports all important insert / update / upsert operations also for multiple related sObjects.

You can download and install the SFDMU Plugin from  [here](https://github.com/forcedotcom/SFDX-Data-Move-Utility).

----

**This repository contains the special <u>Desktop GUI Application</u>, that will help you to prepare and execute data migration packages using the SFDMU Plugin.**

Now you don't have to work with the Terminal / Console. All actions are performed in a visual mode. It's very simple to manage the jobs. You can add and remove org connections, set up SObject mapping, then execute the job. The Application will run the SFDMU Plugin in the background and output  you the console log to give you ability to monitor the export process.

*For the security reasons the Application always uses SFDX CLI authentication flow to manage salesforce connections. Any salesforce environment credentials are not stored, kept or provided by the application itself.* 



## How to run?
```bash
# 1. Install the SFDMU Plugin from: https://github.com/forcedotcom/SFDX-Data-Move-Utility

# 2. Clone this repository.
git clone https://github.com/forcedotcom/SFDX-Data-Move-Utility-Desktop-App.git

# 3. Go into the repository.
cd SFDX-Data-Move-Utility-Desktop-App

# 4. Install Python
https://www.python.org/downloads/release/python-2717/

# 5. Install yarn
https://classic.yarnpkg.com/en/docs/install

# 6. Install node-gyp globally
yarn global add node-gyp

# 7. Install electron globally
yarn global add electron

# 8. Install electron into app directory
yarn add electron

# 9. Install other dependencies
npm install

# 10. Compile.
npm run build

# 11. Run.
npm run main
```



## Notes

* This Application must have the [SFDMU Plugin](https://github.com/forcedotcom/SFDX-Data-Move-Utility) to be installed in your system previously.
  
* The Application puts its configuration & data files into the standard user's Documents path inside dedicated directory named **/SFDMU**.
  
* The Application supports multiple local users. 
  Each user has his own local profile contains all his data, that is encrypted by the encryption key which is the password that is used to login into the application. 
  So user's data never directly exposed to others. But after the creating of your local user's profile, you need to well remember your password because there is no password recovery option.

* Supported all major hosts (Win, MACOS, Linux)



## License

This product is licensed under the Apache License 2.0 - see the [LICENSE.md](LICENSE.md) file for details



