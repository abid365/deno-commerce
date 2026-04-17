<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getCurrentAdmin, getAuthToken, logoutAdmin } from "../services/auth";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../services/product";
import type { Product, ProductPayload } from "../types/product";

const router = useRouter();
const admin = getCurrentAdmin();
const token = getAuthToken();

const loading = ref(true);
const busy = ref(false);
const errorMessage = ref("");
const search = ref("");

const products = ref<Product[]>([]);
const page = ref(1);
const pageSize = 4;

const isModalOpen = ref(false);
const editingProductId = ref<string | null>(null);

const form = ref({
  name: "",
  price: 0,
  quantity: 0,
  size: "",
  colors: "",
  description: "",
});

const filteredProducts = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) {
    return products.value;
  }

  return products.value.filter((product) => {
    const sku = skuFromProduct(product).toLowerCase();
    return product.name.toLowerCase().includes(query) || sku.includes(query);
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredProducts.value.length / pageSize)),
);

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredProducts.value.slice(start, start + pageSize);
});

const totalProducts = computed(() => products.value.length);
const totalValue = computed(() =>
  products.value.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0,
  ),
);
const lowStockCount = computed(
  () => products.value.filter((product) => product.quantity < 10).length,
);

function skuFromProduct(product: Product): string {
  return `SKU-${product.id.slice(0, 8).toUpperCase()}`;
}

function statusFromProduct(product: Product): "IN STOCK" | "LOW STOCK" {
  return product.quantity < 10 ? "LOW STOCK" : "IN STOCK";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    value,
  );
}

function openCreateModal(): void {
  editingProductId.value = null;
  form.value = {
    name: "",
    price: 0,
    quantity: 0,
    size: "",
    colors: "",
    description: "",
  };
  isModalOpen.value = true;
}

function openEditModal(product: Product): void {
  editingProductId.value = product.id;
  form.value = {
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    size: product.size,
    colors: product.colors.join(", "),
    description: product.description,
  };
  isModalOpen.value = true;
}

function closeModal(): void {
  isModalOpen.value = false;
}

function buildPayload(): ProductPayload {
  return {
    name: form.value.name.trim(),
    price: Number(form.value.price),
    quantity: Number(form.value.quantity),
    size: form.value.size.trim(),
    colors: form.value.colors
      .split(",")
      .map((color) => color.trim())
      .filter(Boolean),
    description: form.value.description.trim(),
  };
}

async function loadProducts(): Promise<void> {
  if (!token) {
    await router.push({ name: "admin-login" });
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    products.value = await getProducts(token);
    if (page.value > totalPages.value) {
      page.value = totalPages.value;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load products";
    if (
      message.toLowerCase().includes("invalid") ||
      message.toLowerCase().includes("authorization")
    ) {
      logoutAdmin();
      await router.push({ name: "admin-login" });
      return;
    }
    errorMessage.value = message;
  } finally {
    loading.value = false;
  }
}

async function submitProduct(): Promise<void> {
  if (!token || busy.value) {
    return;
  }

  busy.value = true;
  errorMessage.value = "";

  try {
    const payload = buildPayload();

    if (editingProductId.value) {
      await updateProduct(token, editingProductId.value, payload);
    } else {
      await createProduct(token, payload);
    }

    await loadProducts();
    closeModal();
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Unable to save product";
  } finally {
    busy.value = false;
  }
}

async function removeProduct(product: Product): Promise<void> {
  if (!token || busy.value) {
    return;
  }

  const approved = window.confirm(`Delete ${product.name}?`);
  if (!approved) {
    return;
  }

  busy.value = true;
  errorMessage.value = "";

  try {
    await deleteProduct(token, product.id);
    await loadProducts();
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Unable to delete product";
  } finally {
    busy.value = false;
  }
}

async function logout(): Promise<void> {
  logoutAdmin();
  await router.push({ name: "admin-login" });
}

onMounted(async () => {
  await loadProducts();
});
</script>

<template>
  <div class="dashboard-shell">
    <header class="header-row">
      <div>
        <p class="eyebrow">Boutique Admin</p>
        <p class="sub-eyebrow">Curator Access</p>
        <h1>Inventory Management</h1>
        <p class="lead-copy">
          Manage your curated collection and track stock levels across all
          digital showroom floor locations.
        </p>
      </div>
      <div class="header-actions">
        <span class="admin-email">{{ admin?.email }}</span>
        <button class="secondary" @click="logout">Logout</button>
        <button class="primary" @click="openCreateModal">+ Add Product</button>
      </div>
    </header>

    <section class="metrics-grid">
      <article class="metric-card">
        <p>Total Products</p>
        <h2>{{ totalProducts }}</h2>
      </article>
      <article class="metric-card">
        <p>Total Value</p>
        <h2>${{ formatCurrency(totalValue) }}</h2>
      </article>
      <article class="metric-card warn">
        <p>Low Stock</p>
        <h2>{{ lowStockCount }}</h2>
      </article>
    </section>

    <section class="table-panel">
      <div class="table-toolbar">
        <input
          v-model="search"
          type="search"
          placeholder="Search inventory..."
        />
        <button class="secondary" @click="loadProducts">Refresh</button>
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <p v-if="loading" class="empty-copy">Loading inventory...</p>

      <template v-else>
        <table v-if="paginatedProducts.length > 0">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in paginatedProducts" :key="product.id">
              <td>
                <strong>{{ product.name }}</strong>
                <small>{{ product.description || "No description" }}</small>
              </td>
              <td>{{ skuFromProduct(product) }}</td>
              <td>{{ product.quantity }}</td>
              <td>
                <span
                  :class="[
                    'pill',
                    statusFromProduct(product) === 'LOW STOCK'
                      ? 'low'
                      : 'in-stock',
                  ]"
                >
                  {{ statusFromProduct(product) }}
                </span>
              </td>
              <td class="row-actions">
                <button class="icon-btn" @click="openEditModal(product)">
                  Edit
                </button>
                <button class="icon-btn danger" @click="removeProduct(product)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-else class="empty-copy">
          No products yet. Add your first product to begin.
        </p>

        <footer class="table-footer">
          <span>
            Showing
            {{
              Math.min((page - 1) * pageSize + 1, filteredProducts.length || 1)
            }}
            - {{ Math.min(page * pageSize, filteredProducts.length) }} of
            {{ filteredProducts.length }} products
          </span>
          <div>
            <button class="secondary" :disabled="page <= 1" @click="page--">
              Previous
            </button>
            <button
              class="secondary"
              :disabled="page >= totalPages"
              @click="page++"
            >
              Next
            </button>
          </div>
        </footer>
      </template>
    </section>

    <footer class="page-footer">
      <div>
        <h3>The Editorial Boutique</h3>
        <p>
          Curating elevated essentials for the discerning digital lifestyle.
        </p>
      </div>
      <div class="footer-links">
        <span>Platform</span>
        <span>Sustainability</span>
        <span>Shipping</span>
        <span>Returns</span>
      </div>
      <div class="footer-links">
        <span>Legal</span>
        <span>Privacy</span>
        <span>Terms</span>
      </div>
    </footer>

    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <section class="modal">
        <h3>{{ editingProductId ? "Edit Product" : "Create Product" }}</h3>
        <form class="modal-form" @submit.prevent="submitProduct">
          <label>
            Name
            <input v-model="form.name" required />
          </label>
          <label>
            Price
            <input v-model.number="form.price" type="number" min="0" required />
          </label>
          <label>
            Quantity
            <input
              v-model.number="form.quantity"
              type="number"
              min="0"
              required
            />
          </label>
          <label>
            Size
            <input v-model="form.size" />
          </label>
          <label>
            Colors (comma separated)
            <input v-model="form.colors" />
          </label>
          <label>
            Description
            <textarea v-model="form.description" rows="3"></textarea>
          </label>
          <div class="modal-actions">
            <button class="secondary" type="button" @click="closeModal">
              Cancel
            </button>
            <button class="primary" type="submit" :disabled="busy">
              {{ busy ? "Saving..." : "Save Product" }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>
