# The Desktop GUI Application for the Salesforce Data Loader SFDX Plugin (SFDMU)

```
THE APP VERSION SINCE 3.0.0 IS NOT COMPATIBLE TO EARLIER VERSIONS! PLEASE REINSTALL THE APPLICATION.
--------------------------------------------------------------------------------------
Consider the following:
- You will need to sign-up to the Application again, using the Register page.
- All configurations, created by the previous versions, will not work now, you need to re-create them from scratch 
or you can also transfer the Configuration from older application version to the current by importing a .cfg file created (exported) in the previous version.

```

```
### ------------------------------------------- ###
### - *** Latest version: v3.0.0          ***-  ###
### ------------------------------------------- ###
### - *** Always make sure, that you have *** - ###
### - *** the latest version installed    *** - ###
### ------------------------------------------- ###
```

- #### The plugin repository:   [https://github.com/forcedotcom/SFDX-Data-Move-Utility](https://github.com/forcedotcom/SFDX-Data-Move-Utility)
- ##### For the detailed documentation, visit our Help Center: [https://help.sfdmu.com](https://help.sfdmu.com)
- #####  Submit your issues in the [SFDMU User Support Area](https://help.sfdmu.com/hc/en-us/requests/new).

----

**The advanced Salesforce Data Loader SFDX Plugin (SFDMU) will assist you to populate your org (scratch/development/sandbox/production) with data imported from another org or CSV files. Supports Delete, Insert, Update and Upsert for multiple related sObjects.** 

----
**This repository contains the <u>special Desktop Application</u> allows you to manage SFDMU plugin configuration files <u>from the simple and intuitive UI</u>.**

----



### When can this Application be very useful ?

Apart from the minimal setup the export.json file has a lot of advanced properties that can be leveraged in creating and running complex migration jobs.

Therefore in some cases the json file may become very long and hard to edit it manually using the standard Notepad. 

Now with this Desktop Application you don't have to work with the Notepad and the Console, because all actions are performed in a visual mode. Now it's very simple to manage the migration jobs. You can add and remove org connections, set up SObjects and fields, then run the Plugin from the application itself. 



### Installation and running.
```bash
# 1. Install the SFDMU Plugin from: https://github.com/forcedotcom/SFDX-Data-Move-Utility

# 2. Clone this repository.
git clone https://github.com/forcedotcom/SFDX-Data-Move-Utility-Desktop-App.git

# 3. Go into the project directory.
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
#    or
npm start
```



## Notes

* This Application must have the [SFDMU Plugin](https://github.com/forcedotcom/SFDX-Data-Move-Utility) to be installed in your system previously.
* The Application puts its configuration & data files into the standard user's Documents path inside dedicated directory named **/SFDMU_APP**.
* You can change the default directory in the application's *App Settings* page.
* The Application supports multiple local users. 
  Each user has his own local profile contains all his data, that is encrypted by the encryption key which is the password that is used to login into the application. 
  So user's data never directly exposed to others. But after the creating of your local user's profile, you need to well remember your password because there is no password recovery option.
* Supported all major hosts (Win, MACOS, Linux)



## License

This product is licensed under the BSD-3-Clause - see the [LICENSE.txt](LICENSE.txt) file for details.




