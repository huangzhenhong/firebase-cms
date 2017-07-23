import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { GlobalService } from '../global.service';
import { MdSnackBar } from '@angular/material';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  globalCart: any;
  cartArray: any;
  cartTotal: Number;
  user: Observable<firebase.User>;
  currentShopper: any;

  constructor(public globalService: GlobalService, public db: AngularFireDatabase, public afAuth: AngularFireAuth, public snackBar: MdSnackBar) {
    this.user = afAuth.authState;
    this.cartArray = [];
    this.cartTotal = 0;

    globalService.cart.subscribe((cart) => {
      this.cartArray = [];
      this.cartTotal = 0;
      this.globalCart = cart;
      this.cartArray = (<any>Object).values(this.globalCart);
      for (let i = 0; i < this.cartArray.length; i++) {
        this.cartTotal += this.cartArray[i].total;
      }
    });
  }

  updateCart(item) {
    this.globalCart[item.key] = item;
    this.globalCart[item.key]['total'] = (item.quantity * item.price);
    this.globalService.cart.next(this.globalCart);
  }

  removeItem(item) {
    delete this.globalCart[item.key];
    this.globalService.cart.next(this.globalCart);

    this.user.subscribe((currentShopper) => {
      if (Object.keys(this.globalCart).length === 0) {
        window.localStorage.removeItem('cart');
        this.db.object('/users/' + currentShopper.uid).update({
          cart: null
        });
      }
    });

    let snackBarRef = this.snackBar.open('Item removed', 'OK!', {
      duration: 3000
    });
  }

  ngOnInit() {
  }

}
