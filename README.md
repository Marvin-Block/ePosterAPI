## Datei Struktur

```
ePosterAPI
├── README.md
├── server.js
├── package.json
├── .gitignore
└── app
    ├── config
    │   ├── config.json
    │   ├── db.config.js
    │   └── ldap.config.js
    ├── controllers
    │   ├── device.controller.js
    │   ├── link.controller.js
    │   ├── log.controller.js
    │   └── video.controller.js
    ├── middleware
    │   ├── accessLogger.js
    │   ├── checkUUID.js
    │   └── index.js
    ├── migrations
    │   ├── create-device.js
    │   ├── create-video.js
    │   ├── create-link.js
    │   └── create-log.js
    ├── models
    │   ├── device.js
    │   ├── index.js
    │   ├── link.js
    │   ├── log.js
    │   └── video.js
    ├── modules
    │   ├── ad.module.js
    │   └── file.module.js
    ├── routes
    │   ├── device.routes.js
    │   ├── link.routes.js
    │   ├── log.routes.js
    │   └── video.routes.js
    └── seeders
        ├── demo-device.js
        └── demo-video.js
```