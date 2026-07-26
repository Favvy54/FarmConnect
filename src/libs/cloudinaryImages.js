import cld from "./cloudinary";
import { fill } from "@cloudinary/url-gen/actions/resize";

export const logos = {
  header: cld.image("header-logo_fdihru").format("auto").quality("auto"),
  footer: cld.image("footer-logo_u5t81l").format("auto").quality("auto"),
};

export const backgrounds = {
  hero: cld
    .image('hero-img_dxoybr')
    .format('auto')
    
    .quality('auto'),
  food: cld.image('Food_background_owswjt').format('auto').quality('auto'),
  restaurant: cld
    .image('restaurant_a5vvff')
    .format('auto')
    .quality('auto'),
  cta: cld
    .image('footer-food_kv9gcb')
    .format('auto')
    .quality('auto'),
};

export const auth = {
  signup: cld
    .image('sign-up-img_qcnvoi')
    .format('auto')
    .quality('auto'),
  login: cld
    .image('auth-img_qjqulc')
    .format('auto')
    .quality('auto'),
  confirmation: cld
    .image('Done_ring_round_klpuar')
    .format('auto')
    .quality('auto'),
};

export const icons = {
  handshake: cld
    .image('handshake-icon_gfgltc')
    .format('auto')
    .resize(fill().width(32).height(32))
    .quality('auto'),
  lightning: cld
    .image('lightning-icon_az1rob')
    .format('auto')
    .resize(fill().width(32).height(32))
    .quality('auto'),
  foodBasket: cld
    .image('food-icon_cxxodt')
    .format('auto')
    .resize(fill().width(32).height(32))
    .quality('auto'),
  recycle: cld
    .image('recycle-icon_vpyiuw')
    .format('auto')
    .resize(fill().width(32).height(32))
    .quality('auto'),
};

export const users = {
  user1: cld
    .image('user-1_fah8a9')
    .format('auto')
    .resize(fill().width(32).height(32))
    .quality('auto'),
  user2: cld
    .image('user-2_z75ves')
    .format('auto')
    .resize(fill().width(32).height(32))
    .quality('auto'),
  user3: cld
    .image('user-3_fbando')
    .format('auto')
    .resize(fill().width(32).height(32))
    .quality('auto'),
};