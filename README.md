# Ropeho

[Future website](http://next.ropeho.com) of [Ropeho productions](http://ropeho.com). 

## Run the project

After starting go to [http://localhost:3000](http://localhost:3000) for the main website and [http://localhost:3010](http://localhost:3010) for the admin panel.

### Docker

```
docker-compose up
```

### Local machine

[FFmpeg](https://ffmpeg.org) and [Redis](https://redis.io) are required to run this project. Redis databases number **0** (production) and **1** (development) will be used.

Currently `react-toolbox` has a syntax error that will prevent TypeScript from compiling in `node_modules/react-toolbox/lib/date_picker/DatePicker.d.ts` at `line 135` (that will be fixed in the next release). It has to be fixed by simply adding a `|` before `DatePickerLocale`.

Download and initialize demo data and run in development
```
npm install
npm start
```

Run in development
```
npm install
npm run start:dev
```

Run in production
```
npm install
npm run build
npm run start:prod
```

## Known bugs

* Certain images will fail to delete from the temporary directory after uploading (maybe Windows only)
* WebM will fail to load on Edge despite having used the proper settings for Edge support
* Browsers have troubles displaying medias using column-count (all of them ...)
* Sometimes images and videos elements don't load causing them not to be positionned or displayed
* Layout glitches can be found on some devices (iPhone 7)
* Cookies are not sent in the production setup

## Running tests

Warning: Running tests will flush the local Redis database (db number **2**).
