/**
 * @file Data to be used for the demo
 * @author François Nguyen <https://github.com/lith-light-g>
 */
import { v4 } from "uuid";
import { PresentationTypes, MediaPermissions, MediaTypes, Roles } from "../enum";
import { API_END_POINT } from "../common/helpers/resolveEndPoint";
import uriFriendlyFormat from "../common/helpers/uriFriendlyFormat";
import GenericRepository from "../server/dal/genericRepository";
import LocalMediaManager from "../server/media/localMediaManager";
import { createJpeg, createWebm, createScreenshot } from "../server/media/fileEncoder";
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
            posX: 681,
            posY: 475,
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
            posX: 843,
            posY: 344,
            preview: "http://ropeho.com/img/realisations/BlackM/c.jpg",
            src: "",
            zoom: 0.8
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
            posX: 719,
            posY: 306,
            preview: "http://ropeho.com/img/realisations/BlackM/a.jpg",
            src: "",
            zoom: 0.6
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
            posX: 1042,
            posY: 323,
            preview: "http://ropeho.com/img/realisations/BlackM/b.jpg",
            src: "",
            zoom: 0.5
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
            posX: 885,
            posY: 345,
            preview: "http://ropeho.com/img/realisations/BlackM/c.jpg",
            src: "",
            zoom: 0.6
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
            posX: 424,
            posY: 278,
            preview: "http://ropeho.com/img/realisations/BlackM/e.jpg",
            src: "",
            zoom: 0.6
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
            posX: 551,
            posY: 225,
            preview: "http://ropeho.com/img/realisations/BlackM/f.jpg",
            src: "",
            zoom: 0.6
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
            posX: 417,
            posY: 349,
            preview: "http://ropeho.com/img/realisations/BlackM/g.jpg",
            src: "",
            zoom: 0.5
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
            posX: 705,
            posY: 329,
            preview: "http://ropeho.com/img/realisations/BlackM/h.jpg",
            src: "",
            zoom: 0.7
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
            posX: 428,
            posY: 195,
            preview: "http://ropeho.com/img/realisations/BlackM/i.jpg",
            src: "",
            zoom: 0.7
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
            posX: 744,
            posY: 271,
            preview: "http://ropeho.com/img/realisations/BlackM/j.jpg",
            src: "",
            zoom: 0.7
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
            posX: 630,
            posY: 178,
            preview: "http://ropeho.com/img/realisations/BlackM/k.jpg",
            src: "",
            zoom: 0.8
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
            posX: 779,
            posY: 322,
            preview: "http://ropeho.com/img/realisations/BlackM/l.jpg",
            src: "",
            zoom: 0.6
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
            posX: 450,
            posY: 180,
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
            posX: 435,
            posY: 415,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/arys1.jpg",
            src: "",
            zoom: 0.8
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
            posX: 445,
            posY: 493,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/arys3.jpg",
            src: "",
            zoom: 0.8
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
            posX: 1311,
            posY: 262,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/arys4.jpg",
            src: "",
            zoom: 0.9
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
            posX: 1291,
            posY: 443,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/fabb1.jpg",
            src: "",
            zoom: 0.7
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
            posX: 1200,
            posY: 463,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/fabb2.jpg",
            src: "",
            zoom: 0.8
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
            posX: 480,
            posY: 326,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/fabb3.jpg",
            src: "",
            zoom: 0.8
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
            posX: 515,
            posY: 355,
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
            posX: 416,
            posY: 822,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/vovs1.jpg",
            src: "",
            zoom: 0.8
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
            posX: 813,
            posY: 458,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/vovs2.jpg",
            src: "",
            zoom: 0.5
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
            posX: 443,
            posY: 399,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/vovs3.jpg",
            src: "",
            zoom: 0.6
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
            posX: 541,
            posY: 321,
            preview: "http://ropeho.com/img/realisations/SummerWorkout2014/vovs4.jpg",
            src: "",
            zoom: 0.7
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
            posX: 791,
            posY: 397,
            preview: "http://ropeho.com/img/realisations/RapMag/2.jpg",
            src: "",
            zoom: 0.6
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
            posX: 731,
            posY: 519,
            preview: "http://ropeho.com/img/realisations/RapMag/1.jpg",
            src: "",
            zoom: 0.5
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
            posX: 873,
            posY: 436,
            preview: "http://ropeho.com/img/realisations/RapMag/3.jpg",
            src: "",
            zoom: 0.6
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
            posX: 811,
            posY: 385,
            preview: "http://ropeho.com/img/realisations/RapMag/4.jpg",
            src: "",
            zoom: 0.6
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
            posX: 883,
            posY: 444,
            preview: "http://ropeho.com/img/realisations/RapMag/5.jpg",
            src: "",
            zoom: 0.6
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
            posX: 417,
            posY: 214,
            preview: "http://ropeho.com/img/realisations/RapMag/6.jpg",
            src: "",
            zoom: 0.9
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
            posX: 797,
            posY: 339,
            preview: "http://ropeho.com/img/realisations/RapMag/7.jpg",
            src: "",
            zoom: 0.7
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
            posX: 961,
            posY: 291,
            preview: "http://ropeho.com/img/realisations/RapMag/8.jpg",
            src: "",
            zoom: 0.5
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
            posX: 843,
            posY: 675,
            preview: "https://static.pexels.com/photos/94731/pexels-photo-94731.jpeg",
            src: "",
            zoom: 0.7
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
            posX: 540,
            posY: 224,
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
            posX: 1350,
            posY: 566,
            preview: "https://images.pexels.com/photos/218966/pexels-photo-218966.jpeg?dl&fit=crop&w=1920&h=1281",
            src: "",
            zoom: 0.3
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
            posX: 973,
            posY: 495,
            preview: "https://images.pexels.com/photos/198841/pexels-photo-198841.jpeg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 0.6
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
            posX: 1023,
            posY: 567,
            preview: "https://images.pexels.com/photos/116233/pexels-photo-116233.jpeg?dl&fit=crop&w=1920&h=1272",
            src: "",
            zoom: 0.5
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
            posX: 712,
            posY: 649,
            preview: "https://static.pexels.com/photos/247903/pexels-photo-247903.jpeg",
            src: "",
            zoom: 0.5
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
            posX: 568,
            posY: 415,
            preview: "https://images.pexels.com/photos/26939/pexels-photo-26939.jpg?dl&fit=crop&w=1920&h=1080",
            src: "",
            zoom: 0.8
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
            posX: 844,
            posY: 670,
            preview: "https://static.pexels.com/photos/94731/pexels-photo-94731.jpeg",
            src: "",
            zoom: 0.8
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
            posX: 910,
            posY: 321,
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
            posX: 959,
            posY: 343,
            preview: "https://images.pexels.com/photos/199165/pexels-photo-199165.jpeg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 1.3
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
            posX: 1437,
            posY: 222,
            preview: "https://images.pexels.com/photos/296881/pexels-photo-296881.jpeg?dl&fit=crop&w=1920&h=1058",
            src: "",
            zoom: 0.4
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
            posX: 1098,
            posY: 604,
            preview: "https://static.pexels.com/photos/58592/pexels-photo-58592.jpeg",
            src: "",
            zoom: 0.4
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
            posX: 1254,
            posY: 366,
            preview: "https://static.pexels.com/photos/35188/child-childrens-baby-children-s.jpg",
            src: "",
            zoom: 0.8
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
            posX: 923,
            posY: 618,
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
            posX: 1256,
            posY: 520,
            preview: "https://images.pexels.com/photos/247287/pexels-photo-247287.jpeg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 0.5
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
            posX: 1209,
            posY: 270,
            preview: "https://images.pexels.com/photos/70845/girl-model-pretty-portrait-70845.jpeg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 0.8
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
            posX: 1005,
            posY: 442,
            preview: "https://images.pexels.com/photos/24272/pexels-photo-24272.jpg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 1.3
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
            posX: 1034,
            posY: 439,
            preview: "https://static.pexels.com/photos/11392/pexels-photo-11392.jpeg",
            src: "",
            zoom: 0.7
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
            posX: 241,
            posY: 146,
            preview: "https://ak9.picdn.net/shutterstock/videos/7117489/preview/stock-footage-cool-couple-piggyback-black-and-white.mp4",
            src: "",
            zoom: 1.2
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
            posX: 957,
            posY: 717,
            preview: "https://images.pexels.com/photos/193355/pexels-photo-193355.jpeg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 0.6
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
            posX: 944,
            posY: 239,
            preview: "https://images.pexels.com/photos/27752/pexels-photo.jpg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 0.5
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
            posX: 918,
            posY: 575,
            preview: "https://images.pexels.com/photos/157886/fashionable-girl-in-glasses-in-the-black-pants-157886.jpeg?dl&fit=crop&w=1920&h=1079",
            src: "",
            zoom: 0.5
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
            posX: 994,
            posY: 657,
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
            posX: 986,
            posY: 779,
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
            posX: 1029,
            posY: 932,
            preview: "https://images.pexels.com/photos/219579/pexels-photo-219579.jpeg?dl&fit=crop&w=1920&h=2880",
            src: "",
            zoom: 0.4
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
            posX: 727,
            posY: 568,
            preview: "https://images.pexels.com/photos/292532/pexels-photo-292532.jpeg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 0.8
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
            posX: 970,
            posY: 760,
            preview: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?dl&fit=crop&w=1920&h=1114",
            src: "",
            zoom: 0.5
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
            posX: 1065,
            posY: 597,
            preview: "https://images.pexels.com/photos/349496/pexels-photo-349496.jpeg?dl&fit=crop&w=1920&h=2880",
            src: "",
            zoom: 0.9
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
            posX: 1018,
            posY: 625,
            preview: "https://images.pexels.com/photos/157669/portrait-character-black-and-white-lofty-tone-157669.jpeg?dl&fit=crop&w=1920&h=1147",
            src: "",
            zoom: 0.5
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
            posX: 928,
            posY: 520,
            preview: "https://images.pexels.com/photos/47401/pexels-photo-47401.jpeg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 0.8
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
            posX: 920,
            posY: 491,
            preview: "https://images.pexels.com/photos/262226/pexels-photo-262226.jpeg?dl&fit=crop&w=1920&h=1275",
            src: "",
            zoom: 0.7
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
            posX: 635,
            posY: 664,
            preview: "https://images.pexels.com/photos/25759/pexels-photo.jpg?dl&fit=crop&w=1920&h=1325",
            src: "",
            zoom: 0.5
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
    models: "",
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
            posX: 907,
            posY: 953,
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
            posX: 371,
            posY: 189,
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
            posX: 1825,
            posY: 789,
            preview: "https://images.pexels.com/photos/197264/pexels-photo-197264.jpeg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 0.9
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
            posX: 1321,
            posY: 834,
            preview: "https://static.pexels.com/photos/6870/city-dark-new-york-bridge.jpg",
            src: "",
            zoom: 0.4
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
            posX: 593,
            posY: 185,
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
            posX: 1142,
            posY: 418,
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
            posX: 1218,
            posY: 383,
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
            posX: 301,
            posY: 178,
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
            posX: 908,
            posY: 850,
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
            posX: 537,
            posY: 231,
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
            posX: 1001,
            posY: 566,
            preview: "https://image.shutterstock.com/z/stock-photo-green-new-york-street-sign-malcom-x-and-lenox-289849976.jpg",
            src: "",
            zoom: 0.6
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
            posX: 454,
            posY: 312,
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
    models: "",
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
            posX: 896,
            posY: 547,
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
            posX: 406,
            posY: 184,
            preview: "https://ak3.picdn.net/shutterstock/videos/6802543/preview/stock-footage-tokyo-japan-march-traffic-in-kabuki-cho-district-of-shinjuku-ward-the-area-is-a-renown.mp4",
            src: "",
            zoom: 1.2
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
            posX: 1396,
            posY: 1010,
            preview: "https://images.pexels.com/photos/34142/pexels-photo.jpg?dl&fit=crop&w=1920&h=1280",
            src: "",
            zoom: 0.6
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
            posX: 1791,
            posY: 372,
            preview: "https://images.pexels.com/photos/9651/pexels-photo-9651.jpeg?dl&fit=crop&w=1920&h=1277",
            src: "",
            zoom: 1.1
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
            posX: 1050,
            posY: 293,
            preview: "https://image.shutterstock.com/z/stock-photo-beautiful-asian-girl-wearing-red-kimono-walking-in-the-city-asakusa-tokyo-japan-419306239.jpg",
            src: "",
            zoom: 0.8
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
            posX: 1066,
            posY: 332,
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
            posX: 890,
            posY: 546,
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
            posX: 719,
            posY: 657,
            preview: "https://image.shutterstock.com/z/stock-photo-autumn-in-the-shinjuku-park-tokyo-japan-524375581.jpg",
            src: "",
            zoom: 0.6
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
            posX: 743,
            posY: 393,
            preview: "https://image.shutterstock.com/z/stock-photo-sukiyabashi-intersection-442049602.jpg",
            src: "",
            zoom: 0.5
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
            posX: 752,
            posY: 395,
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
            posX: 780,
            posY: 552,
            preview: "http://ropeho.com/img/accueil/logo1.jpg",
            src: "",
            zoom: 0.5
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
            posX: 753,
            posY: 567,
            preview: "https://images.pexels.com/photos/175696/pexels-photo-175696.jpeg?dl&fit=crop&w=1920&h=1330",
            src: "",
            zoom: 0.7
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    name: "Fashion",
    productionIds: [people._id, blackNWhite._id]
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
            posX: 907,
            posY: 953,
            preview: "https://images.pexels.com/photos/30360/pexels-photo-30360.jpg?dl&fit=crop&w=1920&h=1279",
            src: "",
            zoom: 1
        }],
        state: MediaPermissions.Public,
        type: MediaTypes.Image
    },
    name: "City",
    productionIds: [newYork._id, tokyo._id]
};

// presentations
export const topPresentation: PresentationContainer = {
    _id: v4(),
    type: PresentationTypes.StrictMasonry,
    presentations: [{
        _id: v4(),
        options: {
            columnSpan: 1,
            rowSpan: 1
        } as Ropeho.Models.StrictMasonryPresentationOptions,
        mainText: "Ropeho Productions",
        alternateText: "Photos réalisés par Ropeho Productions",
        mainMedia: {
            _id: v4(),
            delay: 0,
            description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 780,
                posY: 552,
                preview: "http://ropeho.com/img/accueil/logo1.jpg",
                src: "",
                zoom: 0.5
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Image,
        },
        alternateMedia: {
            _id: v4(),
            delay: 2,
            description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 1198,
                posY: 318,
                preview: "http://ropeho.com/img/accueil/Kieu.jpg",
                src: "",
                zoom: 0.5
            }, {
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 376,
                posY: 360,
                preview: "http://ropeho.com/img/accueil/Pauline.jpg",
                src: "",
                zoom: 0.5
            }, {
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 374,
                posY: 330,
                preview: "http://ropeho.com/img/accueil/Vovs.jpg",
                src: "",
                zoom: 0.5
            }, {
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 1020,
                posY: 338,
                preview: "http://ropeho.com/img/accueil/Njees%20my%20Bebey.jpg",
                src: "",
                zoom: 0.5
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Slideshow
        },
        href: `/${uriFriendlyFormat(ropehoCategory.name)}`
    }]
};
export const spiralPresentation: PresentationContainer = {
    _id: v4(),
    type: PresentationTypes.StrictMasonry,
    presentations: [{
        _id: v4(),
        options: {
            columnSpan: 2,
            rowSpan: 1
        } as Ropeho.Models.StrictMasonryPresentationOptions,
        mainText: "Black M",
        alternateText: "Photos the Black M en concert",
        mainMedia: {
            _id: v4(),
            delay: 0,
            description: "© 2014 PIERRE-OLIVIER SAMBA MBAKI",
            sources: [{
                _id: v4(),
                fallback: "",
                fileSize: 0,
                posX: 788,
                posY: 326,
                preview: "http://ropeho.com/img/realisations/BlackM/a.jpg",
                src: "",
                zoom: 0.8
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
                posX: 883,
                posY: 346,
                preview: "http://ropeho.com/img/realisations/BlackM/c.jpg",
                src: "",
                zoom: 0.8
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Image
        },
        href: `/${uriFriendlyFormat(ropehoBlackM.name)}`
    }, {
        _id: v4(),
        options: {
            columnSpan: 1,
            rowSpan: 2
        } as Ropeho.Models.StrictMasonryPresentationOptions,
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
                posX: 936,
                posY: 476,
                preview: "https://images.pexels.com/photos/157886/fashionable-girl-in-glasses-in-the-black-pants-157886.jpeg?dl&fit=crop&w=1920&h=1079",
                src: "",
                zoom: 0.6
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
                posX: 229,
                posY: 155,
                preview: "https://ak9.picdn.net/shutterstock/videos/7117489/preview/stock-footage-cool-couple-piggyback-black-and-white.mp4",
                src: "",
                zoom: 1.9
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Video
        },
        href: `/${uriFriendlyFormat(blackNWhite.name)}`
    }, {
        _id: v4(),
        options: {
            columnSpan: 1,
            rowSpan: 2
        } as Ropeho.Models.StrictMasonryPresentationOptions,
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
                posX: 497,
                posY: 307,
                preview: "http://ropeho.com/img/realisations/SummerWorkout2014/vovs1.jpg",
                src: "",
                zoom: 1.5
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
                posX: 600,
                posY: 292,
                preview: "http://ropeho.com/img/realisations/SummerWorkout2014/arys3.jpg",
                src: "",
                zoom: 1.4
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Image
        },
        href: `/${uriFriendlyFormat(ropehoSummerWorkout.name)}`
    }, {
        _id: v4(),
        options: {
            columnSpan: 1,
            rowSpan: 1
        } as Ropeho.Models.StrictMasonryPresentationOptions,
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
    }, {
        _id: v4(),
        options: {
            columnSpan: 2,
            rowSpan: 1
        } as Ropeho.Models.StrictMasonryPresentationOptions,
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
                posX: 1286,
                posY: 586,
                preview: "https://static.pexels.com/photos/58592/pexels-photo-58592.jpeg",
                src: "",
                zoom: 0.6
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
                posX: 387,
                posY: 137,
                preview: "https://ak6.picdn.net/shutterstock/videos/5993846/preview/stock-footage-young-woman-using-a-smartphone-while-standing-by-her-motorbike-in-the-shopping-district-of-a-city-w.mp4",
                src: "",
                zoom: 1.7
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Video
        },
        href: `/${uriFriendlyFormat(people.name)}`
    }]
};
export const bottomPresentation: PresentationContainer = {
    _id: v4(),
    type: PresentationTypes.StrictMasonry,
    presentations: [{
        _id: v4(),
        options: {
            columnSpan: 1,
            rowSpan: 1
        } as Ropeho.Models.StrictMasonryPresentationOptions,
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
                posX: 1350,
                posY: 1340,
                preview: "https://static.pexels.com/photos/6870/city-dark-new-york-bridge.jpg",
                src: "",
                zoom: 0.3
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
                posX: 301,
                posY: 127,
                preview: "https://ak9.picdn.net/shutterstock/videos/10475159/preview/stock-footage-new-york-feb-taxi-cab-and-liquor-wine-store-upper-west-side-manhattan-black-and-white.mp4",
                src: "",
                zoom: 1.4
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Video
        },
        href: `/${uriFriendlyFormat(newYork.name)}`
    }, {
        _id: v4(),
        options: {
            columnSpan: 1,
            rowSpan: 1
        } as Ropeho.Models.StrictMasonryPresentationOptions,
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
                posX: 735,
                posY: 539,
                preview: "https://image.shutterstock.com/z/stock-photo-japanese-woman-walking-to-red-pagoda-japan-493537408.jpg",
                src: "",
                zoom: 0.5
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
                posX: 302,
                posY: 208,
                preview: "https://ak3.picdn.net/shutterstock/videos/6802543/preview/stock-footage-tokyo-japan-march-traffic-in-kabuki-cho-district-of-shinjuku-ward-the-area-is-a-renown.mp4",
                src: "",
                zoom: 1.4
            }],
            state: MediaPermissions.Public,
            type: MediaTypes.Video
        },
        href: `/${uriFriendlyFormat(tokyo.name)}`
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

export const productions: Production[] = [people, blackNWhite, ropehoBlackM, ropehoRapMag, ropehoSummerWorkout, newYork, tokyo];
export const categories: Category[] = [ropehoCategory, fashionStockCategory, cityStockCategory];
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
                            createJpeg(join(mediaManager.baseDirectory, srcBase), join(mediaManager.baseDirectory, previewBase))
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
                                    dest: join(mediaManager.baseDirectory, previewBase)
                                });
                                const fallbackPng: string = `${basename(fallbackBase, extname(fallbackBase))}.png`;
                                await createScreenshot(join(mediaManager.baseDirectory, srcBase), join(mediaManager.baseDirectory, fallbackPng));
                                await createJpeg(join(mediaManager.baseDirectory, fallbackPng), join(mediaManager.baseDirectory, fallbackBase));
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
                    const sourceURLBase: string = uriFriendlyFormat(sourceURL.indexOf("?") >= 0 ? basename(sourceURL.substring(0, sourceURL.indexOf("?"))) : basename(sourceURL));
                    switch (media.type) {
                        case MediaTypes.Image:
                        case MediaTypes.Slideshow:
                            let srcBase: string = await mediaManager.newName(`${directory}/${sourceURLBase}`);
                            let previewBase: string = `${directory}/${basename(srcBase, extname(srcBase))}_preview.jpeg`;

                            if (await mediaManager.exists(srcBase)) {
                                throw `${srcBase} already exists. Skipping ...`;
                            } else {
                                source.src = `${API_END_POINT}/${srcBase}`;
                                source.preview = `${API_END_POINT}/${previewBase}`;
                                await processImageMedia(sourceURL, srcBase, previewBase);
                            }
                            break;
                        case MediaTypes.Video:
                            srcBase = await mediaManager.newName(`${directory}/${sourceURLBase}`);
                            previewBase = `${directory}/${basename(sourceURLBase, extname(sourceURLBase))}_preview.webm`;
                            const fallbackBase: string = `${directory}/${basename(sourceURLBase, extname(sourceURLBase))}_fallback.jpeg`;

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
        for (let ic: number = 0; ic < presentations.length; ic++ , currentItem++) {
            const container: PresentationContainer = presentations[ic];
            console.info(`Presentation container ${ic} - ${currentItem}/${totalItems}`);
            let cont: boolean = false;
            for (let ip: number = 0; ip < container.presentations.length; ip++) {
                const presentation: Presentation = container.presentations[ip];
                try {
                    await processMedia(presentation.mainMedia, "homepage");
                    await processMedia(presentation.alternateMedia, "homepage");
                } catch (error) {
                    cont = true;
                    continue;
                }
            }
            if (cont) {
                cont = false;
                continue;
            }
            await presentationRepository.create(container);
        }

        for (let i: number = 0; i < categories.length; i++ , currentItem++) {
            const category: Category = categories[i];
            console.info(`Category ${i} (${category.name}) ${currentItem}/${totalItems}`);
            try {
                await processMedia(category.banner, `categories/${uriFriendlyFormat(category.name)}`);
                await categoryRepository.create(category);
            } catch (error) {
                continue;
            }
        }

        for (let i: number = 0; i < productions.length; i++ , currentItem++) {
            const production: Production = productions[i];
            console.info(`Production ${i} (${production.name}) - ${currentItem}/${totalItems}`);
            try {
                await processMedia(production.banner, `productions/${uriFriendlyFormat(production.name)}`);
                await processMedia(production.background, `productions/${uriFriendlyFormat(production.name)}`);
                for (let im: number = 0; im < production.medias.length; im++) {
                    const media: Media = production.medias[im];
                    await processMedia(media, `productions/${uriFriendlyFormat(production.name)}`);
                }
                await productionRepository.create(production);
            } catch (error) {
                console.log(error);
                continue;
            }
        }

        for (let i: number = 0; i < users.length; i++ , currentItem++) {
            const user: User = users[i];
            console.info(`User ${i} (${user.name}) - ${currentItem}/${totalItems}`);
            try {
                await userRepository.create(user);
            } catch (error) {
                continue;
            }
        }
    };
