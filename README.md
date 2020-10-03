# The Desktop GUI Application for the Salesforce Data Loader SFDX Plugin (SFDMU)

```
### ------------------------------------------- ###
### - *** Latest version: v3.1.6          ***-  ###
### ------------------------------------------- ###
### - *** Always make sure, that you have *** - ###
### - *** the latest version installed    *** - ###
### ------------------------------------------- ###
```

- #### The plugin home:   [https://github.com/forcedotcom/SFDX-Data-Move-Utility](https://github.com/forcedotcom/SFDX-Data-Move-Utility)
- ##### For the detailed documentation, visit the [SFDMU Help Center](https://help.sfdmu.com)
- #####  Submit your issues or request a new feature in the [GitHub Issue Tracker](https://github.com/forcedotcom/SFDX-Data-Move-Utility/issues/new/choose).

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

# Make sure you have the latest npm / python / yarn / electron installed on your machine, otherwise perform steps 1 - 4 accordingly. 

# 1. Install Python
https://www.python.org/downloads/

# 2. Install yarn
https://classic.yarnpkg.com/en/docs/install

# 3. Install node-gyp globally
yarn global add node-gyp

# 4. Install electron globally
yarn global add electron 

# 5. Clone this repository.
git clone https://github.com/forcedotcom/SFDX-Data-Move-Utility-Desktop-App.git

# 6. Go into the project directory.
cd SFDX-Data-Move-Utility-Desktop-App

# 7. Install npm dependencies
npm install

# 8. Run the Application.
npm start

```


## Notes

* This Application must have the [SFDMU Plugin](https://github.com/forcedotcom/SFDX-Data-Move-Utility) to be installed in your system previously.
* The Application puts user's data files into the standard **Documents** folder inside dedicated sub-folder named **/SFDMU_APP**.  
  You can change the default path in the application's ***App Settings*** page. 
* The Application also creates a file **user.json** in the application installation directory. This file is being used to store the application settings.
  Make sure you are **NOT DELETING** this file during upgrade the Application from the git repository, otherwise the settings will be lost.
* The Application supports multiple local users. 
  Each user has his own local profile contains all his data, that is encrypted by the encryption key which is the password that is used to login into the application. 
  So user's data never directly exposed to others. But after the creating of your local user's profile, you need to well remember your password because there is no password recovery option.
* Supported all major hosts (Win, MACOS, Linux)



## License

This product is licensed under the BSD-3-Clause - see the [LICENSE.txt](LICENSE.txt) file for details.




