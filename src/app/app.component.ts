import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  productForm: FormGroup;
  products: any[] = [];
  editingProductId: number | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      images: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.fetchProducts();
  }

  submitForm() {
    const productData = {
      name: this.productForm.value.name,
      price: this.productForm.value.price,
      images: this.productForm.value.images.split(','),
    };

    if (this.editingProductId !== null) {
      this.http
        .put(
          `https://angular-postgre-assignment.onrender.com/update-product/${this.editingProductId}`,
          productData
        )
        .subscribe(() => {
          alert('Product updated successfully');
          this.editingProductId = null;
          this.productForm.reset();
          this.fetchProducts();
        });
    } else {
      this.http
        .post(
          'https://angular-postgre-assignment.onrender.com/add-product',
          productData
        )
        .subscribe(() => {
          alert('Product inserted into database');
          this.productForm.reset();
          this.fetchProducts();
        });
    }
  }

  fetchProducts() {
    this.http
      .get<any[]>(
        'https://angular-postgre-assignment.onrender.com/get-products'
      )
      .subscribe((data) => {
        this.products = data;
      });
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.http
        .delete(
          `https://angular-postgre-assignment.onrender.com/delete-product/${id}`
        )
        .subscribe(() => {
          alert('Product deleted successfully');
          this.products = this.products.filter((product) => product.id !== id);
        });
    }
  }

  updateProduct(id: number) {
    const product = this.products.find((p) => p.id === id);
    if (product) {
      this.productForm.setValue({
        name: product.name,
        price: product.price,
        images: product.images.join(','),
      });
      this.editingProductId = id;
    }
  }
}
