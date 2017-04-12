/**
 * @file Data to be used for the demo
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { v4 } from "uuid";
import { PresentationTypes, MediaPermissions, MediaTypes, Roles } from "../enum";
import { API_END_POINT, CLIENT_END_POINT } from "../common/helpers/resolveEndPoint";
import uriFriendlyFormat from "../common/helpers/uriFriendlyFormat";
import GenericRepository from "../server/dal/genericRepository";
import LocalMediaManager from "../server/media/localMediaManager";
import { createWebp, createWebm, createScreenshot } from "../server/media/fileEncoder";
import config from "../config";
import { basename, extname, join } from "path";
import { get as httpGet, IncomingMessage } from "http";
import { get as httpsGet } from "https";
import { computeToken } from "../server/accounts/token";
import { computeHashSync } from "../server/accounts/password";

import Production = Ropeho.Models.Production;
import PresentationContainer = Ropeho.Models.PresentationContainer;
import Presentation = Ropeho.Models.Presentation;
import Category = Ropeho.Models.Category;
import Media = Ropeho.Models.Media;
import Source = Ropeho.Models.Source;
import User = Ropeho.Models.User;
import IGenericRepository = Ropeho.Models.IGenericRepository;

// tslint:disable:no-http-string

// ropeho originals
// img only / public
export const ropehoBlackM: Production = {
    _id: v4(),
    name: "Black M",
    description: "Invité de Prestige à l'événement RENC ART à Courcouronnes, Black Mesrimes, membre du célèbre groupe de RAP français Sexion d'Assaut, nous a interprété quelques titres extraits de son dernier album \"Les yeux plus gros que le monde\" déjà dans les bacs !!!",
    date: new Date("May 25 2014").toString(),
    location: "Renc Art, Courcouronnes",
    models: "Black M",
    banner: {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/BlackM/i.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    background: {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/BlackM/c.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    medias: [{
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/BlackM/a.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/BlackM/b.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/BlackM/c.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/BlackM/e.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/BlackM/f.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/BlackM/g.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/BlackM/h.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/BlackM/i.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/BlackM/j.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/BlackM/k.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/BlackM/l.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }],
    state: MediaPermissions.Public
};
// img only / public
export const ropehoSummerWorkout: Production = {
    _id: v4(),
    name: "Summer Workout 2014",
    description: "Pour les passionnés de sport, voici pour vous le shooting SUMMER WORKOUT 2014 première édition !!! N'hésitez pas vous aussi exposer le résultat de vos efforts !!!",
    date: new Date("Jul 11 2014").toString(),
    location: "Ropeho Studio",
    models: "Fa2b, ER-CFM, Vovs",
    banner: {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/arys2.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    background: {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/arys1.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    medias: [{
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/arys3.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/arys4.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/fabb1.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/fabb2.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/fabb3.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/fabb4.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/vovs1.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/vovs2.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/vovs3.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/vovs4.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }],
    state: MediaPermissions.Public
};
// img only / private
export const ropehoRapMag: Production = {
    _id: v4(),
    name: "Rap Mag",
    description: "A l'occasion de la nouvelle edition de son magasine, Rap Mag organise une soirée de lancement à laquelle MuzikSpirit ainsi que Ropeho Production sont conviés. Nous y retrouverons des artistes tel que Kayna Samet, Charly Bell, Lord Kossity et beaucoup d'autres ! Le premier numéro sera disponible en kiosque début juillet.",
    date: new Date("Jun 26 2014").toString(),
    location: "KUBE Hotel, Paris",
    models: "Rock Blood, Kayna Samet, Lord Kossity, Charly Bell, Stanley, Sully Sefil, Tonton Marcel",
    banner: {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/RapMag/2.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    background: {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/RapMag/1.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    medias: [{
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/RapMag/3.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/RapMag/4.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/RapMag/5.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/RapMag/6.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/RapMag/7.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/realisations/RapMag/8.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }],
    state: MediaPermissions.OwnerOnly
};

// pexels / shutterstock photos
// img w/ video bg / public
export const people: Production = {
    _id: v4(),
    date: new Date().toString(),
    description: "Some good looking people",
    location: "Stock photos",
    models: "Various",
    name: "Colors",
    state: MediaPermissions.Public,
    banner: {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://static.pexels.com/photos/94731/pexels-photo-94731.jpeg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    background: {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://ak6.picdn.net/shutterstock/videos/5993846/preview/stock-footage-young-woman-using-a-smartphone-while-standing-by-her-motorbike-in-the-shopping-district-of-a-city-w.mp4",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Video
    },
    medias: [{
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/218966/pexels-photo-218966.jpeg?dl&fit=crop&w=1920&h=1281",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/198841/pexels-photo-198841.jpeg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/116233/pexels-photo-116233.jpeg?dl&fit=crop&w=1920&h=1272",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://static.pexels.com/photos/247903/pexels-photo-247903.jpeg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/26939/pexels-photo-26939.jpg?dl&fit=crop&w=1920&h=1080",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://static.pexels.com/photos/94731/pexels-photo-94731.jpeg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/24257/pexels-photo-24257.jpg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/199165/pexels-photo-199165.jpeg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/296881/pexels-photo-296881.jpeg?dl&fit=crop&w=1920&h=1058",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://static.pexels.com/photos/58592/pexels-photo-58592.jpeg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://static.pexels.com/photos/35188/child-childrens-baby-children-s.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/310419/pexels-photo-310419.jpeg?dl&fit=crop&w=1920&h=1085",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/247287/pexels-photo-247287.jpeg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/70845/girl-model-pretty-portrait-70845.jpeg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/24272/pexels-photo-24272.jpg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }]
};
export const blackNWhite: Production = {
    _id: v4(),
    date: new Date().toString(),
    description: "Some good looking people",
    location: "Stock photos",
    models: "Various",
    name: "Black & White",
    state: MediaPermissions.Public,
    banner: {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://static.pexels.com/photos/11392/pexels-photo-11392.jpeg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    background: {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://ak9.picdn.net/shutterstock/videos/7117489/preview/stock-footage-cool-couple-piggyback-black-and-white.mp4",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Video
    },
    medias: [{
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/193355/pexels-photo-193355.jpeg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/27752/pexels-photo.jpg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/157886/fashionable-girl-in-glasses-in-the-black-pants-157886.jpeg?dl&fit=crop&w=1920&h=1079",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/23971/pexels-photo-23971.jpg?dl&fit=crop&w=1920&h=1278",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/9687/pexels-photo.jpg?dl&fit=crop&w=1920&h=1452",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/219579/pexels-photo-219579.jpeg?dl&fit=crop&w=1920&h=2880",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/292532/pexels-photo-292532.jpeg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?dl&fit=crop&w=1920&h=1114",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/349496/pexels-photo-349496.jpeg?dl&fit=crop&w=1920&h=2880",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/157669/portrait-character-black-and-white-lofty-tone-157669.jpeg?dl&fit=crop&w=1920&h=1147",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/47401/pexels-photo-47401.jpeg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/262226/pexels-photo-262226.jpeg?dl&fit=crop&w=1920&h=1275",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/25759/pexels-photo.jpg?dl&fit=crop&w=1920&h=1325",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }]
};
export const newYork: Production = {
    _id: v4(),
    date: new Date().toString(),
    description: "I heard they have tasty pizzas",
    location: "Stock photos",
    models: "Various",
    name: "New York",
    state: MediaPermissions.Public,
    banner: {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/30360/pexels-photo-30360.jpg?dl&fit=crop&w=1920&h=1279",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    background: {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://ak9.picdn.net/shutterstock/videos/10475159/preview/stock-footage-new-york-feb-taxi-cab-and-liquor-wine-store-upper-west-side-manhattan-black-and-white.mp4",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Video
    },
    medias: [{
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/197264/pexels-photo-197264.jpeg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://static.pexels.com/photos/6870/city-dark-new-york-bridge.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/1440/city-road-street-buildings.jpg?dl&fit=crop&w=1920&h=1262",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/29732/pexels-photo-29732.jpg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/296492/pexels-photo-296492.jpeg?dl&fit=crop&w=1920&h=1080",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/279166/pexels-photo-279166.jpeg?dl&fit=crop&w=1920&h=1440",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/30360/pexels-photo-30360.jpg?dl&fit=crop&w=1920&h=1279",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://image.shutterstock.com/z/stock-photo-harlem-nyc-two-way-street-576374221.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://image.shutterstock.com/z/stock-photo-green-new-york-street-sign-malcom-x-and-lenox-289849976.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://image.shutterstock.com/z/stock-photo-old-dirty-apartment-buildings-facing-an-alley-in-new-york-city-451520767.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }]
};
export const tokyo: Production = {
    _id: v4(),
    date: new Date().toString(),
    description: "I heard they have tasty sushis",
    location: "Stock photos",
    models: "Various",
    name: "Tokyo",
    state: MediaPermissions.Public,
    banner: {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://image.shutterstock.com/z/stock-photo-japanese-woman-walking-to-red-pagoda-japan-493537408.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    background: {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://ak3.picdn.net/shutterstock/videos/6802543/preview/stock-footage-tokyo-japan-march-traffic-in-kabuki-cho-district-of-shinjuku-ward-the-area-is-a-renown.mp4",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Video
    },
    medias: [{
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/34142/pexels-photo.jpg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/9651/pexels-photo-9651.jpeg?dl&fit=crop&w=1920&h=1277",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://image.shutterstock.com/z/stock-photo-beautiful-asian-girl-wearing-red-kimono-walking-in-the-city-asakusa-tokyo-japan-419306239.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://image.shutterstock.com/z/stock-photo-tokyo-japan-view-of-shibuya-crossing-one-of-the-busiest-crosswalks-in-the-world-289571369.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://image.shutterstock.com/z/stock-photo-japanese-woman-walking-to-red-pagoda-japan-493537408.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://image.shutterstock.com/z/stock-photo-autumn-in-the-shinjuku-park-tokyo-japan-524375581.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://image.shutterstock.com/z/stock-photo-sukiyabashi-intersection-442049602.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }, {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://image.shutterstock.com/z/stock-photo-sushi-from-tsukiji-fish-market-in-tokyo-japan-377673229.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    }]
};

// categories
export const ropehoCategory: Category = {
    _id: v4(),
    banner: {
        _id: v4(),
        delay: 0,
        description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "http://ropeho.com/img/accueil/logo1.jpg",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    name: "Ropeho Originals",
    productionIds: [ropehoBlackM._id, ropehoSummerWorkout._id, ropehoRapMag._id]
};
export const fashionStockCategory: Category = {
    _id: v4(),
    banner: {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/175696/pexels-photo-175696.jpeg?dl&fit=crop&w=1920&h=1330",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    name: "Fashion",
    productionIds: []
};
export const cityStockCategory: Category = {
    _id: v4(),
    banner: {
        _id: v4(),
        delay: 0,
        description: "",
        sources: [{
            _id: v4(),
            fallback: "",
            fileSize: 0,
            posX: 0,
            posY: 0,
            preview: "https://images.pexels.com/photos/30360/pexels-photo-30360.jpg?dl&fit=crop&w=1920&h=1279",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    name: "City",
    productionIds: []
};

// presentations
export const topPresentation: PresentationContainer = {
    _id: v4(),
    type: PresentationTypes.Horizontal,
    presentations: [{
        _id: v4(),
        mainText: "Ropeho Productions",
        alternateText: "Shootings réalisés par Ropeho Productions",
        mainMedia: {
            _id: v4(),
            delay: 0,
            description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "http://ropeho.com/img/accueil/logo1.jpg",
                src: "",
                zoom: 1
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Image
        },
        alternateMedia: {
            _id: v4(),
            delay: 0,
            description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "http://ropeho.com/img/accueil/Kieu.jpg",
                src: "",
                zoom: 1
            }, {
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "http://ropeho.com/img/accueil/Pauline.jpg",
                src: "",
                zoom: 1
            }, {
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "http://ropeho.com/img/accueil/Vovs.jpg",
                src: "",
                zoom: 1
            }, {
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "http://ropeho.com/img/accueil/Njees%20my%20Bebey.jpg",
                src: "",
                zoom: 1
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Slideshow
        },
        href: uriFriendlyFormat(`${CLIENT_END_POINT}/${ropehoCategory.name}`)
    }]
};
export const spiralPresentation: PresentationContainer = {
    _id: v4(),
    type: PresentationTypes.Spiral,
    presentations: [{
        _id: v4(),
        mainText: "Black M",
        alternateText: "Shooting the Black M en concert",
        mainMedia: {
            _id: v4(),
            delay: 0,
            description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "http://ropeho.com/img/realisations/BlackM/a.jpg",
                src: "",
                zoom: 1
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Image
        },
        alternateMedia: {
            _id: v4(),
            delay: 0,
            description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "http://ropeho.com/img/realisations/BlackM/c.jpg",
                src: "",
                zoom: 1
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Image
        },
        href: uriFriendlyFormat(`${CLIENT_END_POINT}/${ropehoBlackM.name}`)
    }, {
        _id: v4(),
        mainText: "Black & White",
        alternateText: "Photos noir et blanc",
        mainMedia: {
            _id: v4(),
            delay: 0,
            description: "",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "https://images.pexels.com/photos/157886/fashionable-girl-in-glasses-in-the-black-pants-157886.jpeg?dl&fit=crop&w=1920&h=1079",
                src: "",
                zoom: 1
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Image
        },
        alternateMedia: {
            _id: v4(),
            delay: 0,
            description: "",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "https://ak9.picdn.net/shutterstock/videos/7117489/preview/stock-footage-cool-couple-piggyback-black-and-white.mp4",
                src: "",
                zoom: 1
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Video
        },
        href: uriFriendlyFormat(`${CLIENT_END_POINT}/${blackNWhite.name}`)
    }, {
        _id: v4(),
        mainText: "Summer Workout 2014",
        alternateText: "Photos prises dans le studio",
        mainMedia: {
            _id: v4(),
            delay: 0,
            description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "http://ropeho.com/img/realisations/SummerWorkout2014/vovs1.jpg",
                src: "",
                zoom: 1
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Image
        },
        alternateMedia: {
            _id: v4(),
            delay: 0,
            description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "http://ropeho.com/img/realisations/SummerWorkout2014/arys3.jpg",
                src: "",
                zoom: 1
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Image
        },
        href: uriFriendlyFormat(`${CLIENT_END_POINT}/${ropehoSummerWorkout.name}`)
    }, {
        _id: v4(),
        mainText: "Colors",
        alternateText: "Photos pas noir et blanc",
        mainMedia: {
            _id: v4(),
            delay: 0,
            description: "",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "https://static.pexels.com/photos/58592/pexels-photo-58592.jpeg",
                src: "",
                zoom: 1
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Image
        },
        alternateMedia: {
            _id: v4(),
            delay: 0,
            description: "",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "https://ak6.picdn.net/shutterstock/videos/5993846/preview/stock-footage-young-woman-using-a-smartphone-while-standing-by-her-motorbike-in-the-shopping-district-of-a-city-w.mp4",
                src: "",
                zoom: 1
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Video
        },
        href: uriFriendlyFormat(`${CLIENT_END_POINT}/${people.name}`)
    }, {
        _id: v4(),
        mainText: "",
        alternateText: "",
        mainMedia: {
            _id: v4(),
            delay: 0,
            description: "Ropeho Productions",
            sources: [],
            state: MediaPermissions.Public,
            type: MediaTypes.Text
        },
        alternateMedia: {
            _id: v4(),
            delay: 0,
            description: "",
            sources: [],
            state: MediaPermissions.Public,
            type: MediaTypes.Text
        },
        href: ""
    }]
};
export const bottomPresentation: PresentationContainer = {
    _id: v4(),
    type: PresentationTypes.Spiral,
    presentations: [{
        _id: v4(),
        mainText: "New York",
        alternateText: "La grande ville de New York",
        mainMedia: {
            _id: v4(),
            delay: 0,
            description: "",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "https://static.pexels.com/photos/6870/city-dark-new-york-bridge.jpg",
                src: "",
                zoom: 1
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Image
        },
        alternateMedia: {
            _id: v4(),
            delay: 0,
            description: "",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "https://ak9.picdn.net/shutterstock/videos/10475159/preview/stock-footage-new-york-feb-taxi-cab-and-liquor-wine-store-upper-west-side-manhattan-black-and-white.mp4",
                src: "",
                zoom: 1
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Video
        },
        href: uriFriendlyFormat(`${CLIENT_END_POINT}/${newYork.name}`)
    }, {
        _id: v4(),
        mainText: "Tokyo",
        alternateText: "La grande ville de Tokyo",
        mainMedia: {
            _id: v4(),
            delay: 0,
            description: "",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "https://image.shutterstock.com/z/stock-photo-japanese-woman-walking-to-red-pagoda-japan-493537408.jpg",
                src: "",
                zoom: 1
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Image
        },
        alternateMedia: {
            _id: v4(),
            delay: 0,
            description: "",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 0,
                posY: 0,
                preview: "https://ak3.picdn.net/shutterstock/videos/6802543/preview/stock-footage-tokyo-japan-march-traffic-in-kabuki-cho-district-of-shinjuku-ward-the-area-is-a-renown.mp4",
                src: "",
                zoom: 1
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Video
        },
        href: uriFriendlyFormat(`${CLIENT_END_POINT}/${newYork.name}`)
    }]
};

// users
export const users: User[] = [{
    productionIds: [ropehoRapMag._id],
    role: Roles.Administrator,
    token: computeToken(),
    email: "user@ropeho.com",
    name: "John",
    password: computeHashSync("123456").toString("hex"),
    facebookId: ""
}];

export const productions: Production[] = [newYork, tokyo, ropehoBlackM, ropehoRapMag, ropehoSummerWorkout, people, blackNWhite];
export const categories: Category[] = [cityStockCategory, fashionStockCategory, ropehoCategory];
export const presentations: PresentationContainer[] = [topPresentation, spiralPresentation, bottomPresentation];

export const init: () => Promise<void> =
    async (): Promise<void> => {
        // tslint:disable:no-console
        console.info("Initializing the database with demo data ...");
        const categoryRepository: IGenericRepository<Category> = new GenericRepository<Category>({
            ...config.redis,
            ...config.database.categories
        });
        const productionRepository: IGenericRepository<Production> = new GenericRepository<Production>({
            ...config.redis,
            ...config.database.productions
        });
        const presentationRepository: IGenericRepository<PresentationContainer> = new GenericRepository<PresentationContainer>({
            ...config.redis,
            ...config.database.presentations
        });
        const userRepository: IGenericRepository<User> = new GenericRepository<User>({
            ...config.redis,
            ...config.database.users
        });
        const mediaManager: LocalMediaManager = new LocalMediaManager();

        const processImageMedia: (url: string, srcBase: string, previewBase: string) => Promise<void> =
            (url: string, srcBase: string, previewBase: string): Promise<void> => new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
                const handleImageResponse: (res: IncomingMessage) => void =
                    (res: IncomingMessage): void => {
                        const destStream: NodeJS.WritableStream = mediaManager.startUpload(srcBase);
                        res.pipe(destStream);
                        res.on("error", (error: NodeJS.ErrnoException) => reject(error));
                        res.on("end", () => {
                            createWebp(join(mediaManager.baseDirectory, srcBase), join(mediaManager.baseDirectory, previewBase))
                                .then(() => {
                                    resolve();
                                }, (err: Error) => {
                                    reject(err);
                                });
                        });
                    };
                if (url.startsWith("https")) {
                    httpsGet(url, handleImageResponse);
                } else {
                    httpGet(url, handleImageResponse);
                }
            });

        const processVideoMedia: (url: string, srcBase: string, previewBase: string, fallbackBase: string) => Promise<void> =
            (url: string, srcBase: string, previewBase: string, fallbackBase: string): Promise<void> => new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
                const handleImageResponse: (res: IncomingMessage) => void =
                    (res: IncomingMessage): void => {
                        const destStream: NodeJS.WritableStream = mediaManager.startUpload(srcBase);
                        res.pipe(destStream);
                        res.on("error", (error: NodeJS.ErrnoException) => reject(error));
                        res.on("end", async () => {
                            try {
                                await createWebm(join(mediaManager.baseDirectory, srcBase), {
                                    dest: join(mediaManager.baseDirectory, previewBase),
                                    setProgress: (progress: number) => console.log(`${progress}% ...`)
                                });
                                const fallbackPng: string = `${basename(fallbackBase, extname(fallbackBase))}.png`;
                                await createScreenshot(join(mediaManager.baseDirectory, srcBase), join(mediaManager.baseDirectory, fallbackPng));
                                await createWebp(join(mediaManager.baseDirectory, fallbackPng), join(mediaManager.baseDirectory, fallbackBase));
                                await mediaManager.delete(fallbackPng);
                                resolve();
                            } catch (error) {
                                reject(error);
                            }
                        });
                    };
                if (url.startsWith("https")) {
                    httpsGet(url, handleImageResponse);
                } else {
                    httpGet(url, handleImageResponse);
                }
            });

        const processMedia: (media: Media, directory?: string) => Promise<void> =
            async (media: Media, directory: string = "homepage"): Promise<void> => {
                for (let is: number = 0; is < media.sources.length; is++) {
                    const source: Source = media.sources[is];

                    // renaming
                    const sourceURL: string = source.preview;
                    const sourceURLBase: string = sourceURL.indexOf("?") >= 0 ? basename(sourceURL.substring(0, sourceURL.indexOf("?"))) : basename(sourceURL);
                    switch (media.type) {
                        case MediaTypes.Image:
                        case MediaTypes.Slideshow:
                            let srcBase: string = `${directory}/${sourceURLBase}`;
                            let previewBase: string = `${directory}/${basename(sourceURLBase, extname(sourceURLBase))}_preview.webp`;

                            if (await mediaManager.exists(srcBase)) {
                                throw `${srcBase} already exists. Skipping ...`;
                            } else {
                                source.src = `${API_END_POINT}/${srcBase}`;
                                source.preview = `${API_END_POINT}/${previewBase}`;
                                await processImageMedia(sourceURL, srcBase, previewBase);
                            }
                            break;
                        case MediaTypes.Video:
                            srcBase = `${directory}/${sourceURLBase}`;
                            previewBase = `${directory}/${basename(sourceURLBase, extname(sourceURLBase))}_preview.webm`;
                            const fallbackBase: string = `${directory}/${basename(sourceURLBase, extname(sourceURLBase))}_fallback.webp`;

                            if (await mediaManager.exists(srcBase)) {
                                throw `${srcBase} already exists. Skipping ...`;
                            } else {
                                source.src = `${API_END_POINT}/${srcBase}`;
                                source.preview = `${API_END_POINT}/${previewBase}`;
                                source.fallback = `${API_END_POINT}/${fallbackBase}`;
                                await processVideoMedia(sourceURL, srcBase, previewBase, fallbackBase);
                            }
                            break;
                    }
                }
            };

        const totalItems: number = productions.length + categories.length + presentations.length + users.length;
        let currentItem: number = 1;
        for (let ic: number = 0; ic < presentations.length; ic++) {
            const container: PresentationContainer = presentations[ic];
            for (let ip: number = 0; ip < container.presentations.length; ip++ , currentItem++) {
                const presentation: Presentation = container.presentations[ip];
                console.info(`${currentItem}/${totalItems}`);
                try {
                    await processMedia(presentation.mainMedia, "homepage");
                    await processMedia(presentation.alternateMedia, "homepage");
                    presentationRepository.create(presentation);
                } catch (error) {
                    continue;
                }
            }
        }

        for (let i: number = 0; i < categories.length; i++ , currentItem++) {
            const category: Category = categories[i];
            console.info(`${currentItem}/${totalItems}`);
            try {
                await processMedia(category.banner, `categories/${uriFriendlyFormat(category.name)}`);
                categoryRepository.create(category);
            } catch (error) {
                continue;
            }
        }

        for (let i: number = 0; i < productions.length; i++ , currentItem++) {
            const production: Production = productions[i];
            console.info(`${currentItem}/${totalItems}`);
            try {
                await processMedia(production.banner, `productions/${uriFriendlyFormat(production.name)}`);
                await processMedia(production.background, `productions/${uriFriendlyFormat(production.name)}`);
                for (let im: number; im < production.medias.length; im++) {
                    const media: Media = production.medias[im];
                    console.log(`Media ${im}`);
                    await processMedia(media, `productions/${uriFriendlyFormat(production.name)}`);
                }
                productionRepository.create(production);
            } catch (error) {
                continue;
            }
        }

        for (let i: number = 0; i < users.length; i++ , currentItem++) {
            const user: User = users[i];
            console.info(`${currentItem}/${totalItems}`);
            try {
                userRepository.create(user);
            } catch (error) {
                continue;
            }
        }
    };
