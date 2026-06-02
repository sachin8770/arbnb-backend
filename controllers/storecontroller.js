import Home from '../models/home.js';
import fs from 'fs';
import path from 'path';
import rootDir from '../utils/pathUtil.js';
import { User } from '../models/user.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const gethomes = async (req, res, next) => {
  try {
    const homes = await Home.find();

    let favouriteSet = new Set();
     console.log(req.user);
    // ONLY if user is logged in
    if (req.user) {
      const user = await User.findById(req.user._id).select("favourites");

      favouriteSet = new Set(
        user.favourites.map((id) => id.toString())
      );
    }

    const homesWithFav = homes.map((home) => {
      return {
        ...home.toObject(),
        isFavourite: favouriteSet.has(home._id.toString()),
      };
    });

    return res.status(200).json(homesWithFav);
  } catch (error) {
    next(error);
  }
};
const getbookings = async (req, res, next) => {
  const registeredHomes = await Home.find();
  res.render('store/bookings', { isLogined: req.isLogined, user: req.session.user, registeredHomes: registeredHomes, pageTitle: 'my bookings', currentpage: 'Bookings' });
};
const getFavouritesController = async (req, res) => {
  try {
    const userId = req.user._id;

    const favourites = await User.aggregate([
      {
        $match: {
          _id: userId,
        },
      },
      {
        $lookup: {
          from: "homes", // collection name
          localField: "favourites",
          foreignField: "_id",
          as: "favouriteHomes",
        },
      },
      {
        $project: {
          _id: 0,
          favouriteHomes: 1,
        },
      },
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        favourites[0]?.favouriteHomes || [],
        "Favourites fetched successfully"
      )
    );
  } catch (err) {
    console.log(err);

    return res.status(err.statusCode || 500).json(
      new ApiResponse(
        err.statusCode || 500,
        null,
        err.message || "Error fetching favourites"
      )
    );
  }
};

const reservd = async (req, res, next) => {
  const registeredHomes = await Home.find();
  res.render('store/reserved', { isLogined: req.isLogined, user: req.session.user, registeredHomes: registeredHomes, pageTitle: 'my reserved homes', currentpage: 'reserved' });
};


const getEditHome = (req, res, next) => {
  const homeId = req.params.homeid;
  const editing = req.query.editing === "true";

  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found for editing.");
      return res.redirect("/host/home-list");
    }
    res.render("store/getid", { isLogined:req.isLogined, user: req.session.user, home, pageTitle: "Edit your Home", currentPage: "host-homes", editing: editing });
  });
};
const posteditredirect = (req, res, next) => {
  const id = req.params.homeid;
  const { name, price, location, rating } = req.body;

  Home.findById(id)
    .then((home) => {
      if (!home) {
        return res.status(404).send("Home not found");
      }

      home.name = name;
      home.price = price;
      home.location = location;
      home.rating = rating;
      console.log(req.file);
     if (req.file) {
  const oldImagePath = path.join(__dirname, '..', 'public', home.photo);

  fs.unlink(oldImagePath, (err) => {
    if (err) {
      console.log("error while editing a photo", err);
    }
  });

  home.photo = '/uploads/' + req.file.filename;
}
      console.log(home);
      return home.save();
    })
    .then(() => {
      console.log("call from posteditredirect");
      res.redirect('/gethomes');
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error while editing home");
    });
};
const getarbnbhomes =  (req, res, next) => {
 
    res.redirect('/host/home-list');
  };
  const gethomeshost = async (req, res, next) => {
    const registeredHomes = await Home.find();
   return registeredHomes;
  };


const getHouseRules = [
  (req, res, next) => {
    console.log(req.session.isLogined)
    if (!req.session.isLogined) {
      return res.redirect("/login");
    }
    next();
  },

  (req, res, next) => {
    const homeId = req.params.homeId;

    // We can make it house specific after have homeId in file name
  const rulesFileName = 'Rules.pdf';

   const filePath = path.join(rootDir, 'rules', 'House', rulesFileName);

    // res.sendFile(filePath);
    console.log(filePath);
    res.download(filePath, 'Rules.pdf');
  }
];
  
export {
  posteditredirect,
  gethomes,
  getbookings,
  getFavouritesController,
  reservd,
  getEditHome,
  getarbnbhomes,
  gethomeshost,
  getHouseRules,
};