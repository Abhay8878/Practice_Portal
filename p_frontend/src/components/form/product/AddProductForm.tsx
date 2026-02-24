"use client";

import { cn } from "../../../lib/utils";
import { useForm } from "react-hook-form";
import { format, addDays, startOfDay } from "date-fns";
import { X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { MessageSquare, Box, Layers } from "lucide-react";
import ThreeDimensionalViewer from "../../ThreeDimensionalViewer";

import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Textarea } from "../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

import {
  createOrder,
  updateOrder,
  getProductLists,
  getProductTypes,
  getProductImage,
  type Order,
  type Image3DMetadata,
} from "../../../api/orders.api";
import TeethSelector from "./TeethSelector";
import { SelectableToothGrid } from "./SelectableToothShade";
import { restorationShade } from "./ShadeDetails";
import { useLanguage } from "../../../language/useLanguage";
import strings from "../../../language";

/* ---------- TYPES ---------- */
type Props = {
  patientId: string;
  onSuccess: () => void;
  order?: Order | null;
  isEdit?: boolean;
};

type FormValues = {
  product_list: string;
  product_type: string;
  shade: string;
  tooth_numbers: string[][];
  priority: string;
  order_date: Date;
  expected_delivery: Date;
  design_notes?: string;
  image?: FileList;
  image_3d?: FileList;
};

type TeethColors = {
  defaultFill: string;
  selectedFill: string;
  hoverFill: string;
  textDefault: string;
  textSelected: string;
  textSelectionbg: string;
};

export default function AddProductForm({
  patientId,
  onSuccess,
  order,
  isEdit = false,
}: Props) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = strings[language];

  /* ---------- STATE ---------- */
  const [productLists, setProductLists] = useState<
    { list_id: number; list_name: string }[]
  >([]);
  const [productTypes, setProductTypes] = useState<
    { product_id: number; product_name: string }[]
  >([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- 3D IMAGE UPLOAD STATE ---------- */
  const [image3dFiles, setImage3dFiles] = useState<File[]>([]);
  const [existingImage3d, setExistingImage3d] = useState<
    { url: string; metadata?: Image3DMetadata }[]
  >([]);
  useEffect(() => {
    console.log("existingImage3d changed:", existingImage3d);
  }, [existingImage3d]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedModelIndex, setSelectedModelIndex] = useState<number | null>(
    null,
  );
  const image3dInputRef = useRef<HTMLInputElement>(null);

  /* ---------- FORM ---------- */
  const form = useForm<FormValues>({
    defaultValues: {
      product_list: "",
      product_type: "",
      shade: "",
      tooth_numbers: [],
      priority: "MEDIUM",
      order_date: startOfDay(new Date()),
      expected_delivery: addDays(startOfDay(new Date()), 7),
      design_notes: "",
      image: undefined,
      image_3d: undefined,
    },
  });

  /* ---------- DATA FETCHING ---------- */
  useEffect(() => {
    async function fetchLists() {
      try {
        const lists = await getProductLists();
        setProductLists(lists);
      } catch (error) {
        console.error("Failed to fetch product lists:", error);
      }
    }
    fetchLists();
  }, []);
  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && order) {
      let teeth: string[][] = [];
      try {
        if (order.tooth_numbers) {
          const flatTeeth = String(order.tooth_numbers)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          teeth = [flatTeeth];
        }
      } catch (e) {
        console.error("Error parsing tooth numbers", e);
      }

      form.reset({
        product_list: order.product_list,
        product_type: order.product_type,
        shade: order.shade ? order.shade.split(":")[0] : "",
        tooth_numbers: teeth,
        priority: order.priority,
        order_date: new Date(order.order_date),
        expected_delivery: order.expected_delivery
          ? new Date(order.expected_delivery)
          : new Date(),
        design_notes: order.design_notes || "",
        image: undefined,
      });
    }
  }, [isEdit, order, form]);

  const selectedProductList = form.watch("product_list");
  const selectedProductType = form.watch("product_type");

  // Force sync product_list when lists are loaded
  useEffect(() => {
    if (isEdit && order && productLists.length > 0) {
      const currentVal = form.getValues("product_list");
      if (!currentVal || currentVal === "") {
        console.log("Forcing product_list sync to:", order.product_list);
        form.setValue("product_list", order.product_list);
      }
    }
  }, [productLists, isEdit, order?.order_id, form]);

  // Force sync product_type when types are loaded
  useEffect(() => {
    if (isEdit && order && productTypes.length > 0) {
      const currentVal = form.getValues("product_type");
      if (!currentVal || currentVal === "") {
        console.log("Forcing product_type sync to:", order.product_type);
        form.setValue("product_type", order.product_type);
      }
    }
  }, [productTypes, isEdit, order?.order_id, form]);

  /* ---------- SYNC FORM WITH ORDER DATA (FOR EDIT) ---------- */
  useEffect(() => {
    if (isEdit && order) {
      console.log("Pre-filling form with order:", order);
      let teeth: string[][] = [];
      try {
        if (order.tooth_numbers) {
          const flatTeeth = String(order.tooth_numbers)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          teeth = [flatTeeth];
        }
      } catch (e) {
        console.error("Error parsing tooth numbers", e);
      }

      form.reset({
        product_list: order.product_list,
        product_type: order.product_type,
        shade: order.shade ? order.shade.split(":")[0] : "",
        tooth_numbers: teeth,
        priority: order.priority,
        order_date: new Date(order.order_date),
        expected_delivery: order.expected_delivery
          ? new Date(order.expected_delivery)
          : new Date(),
        design_notes: order.design_notes || "",
        image: undefined,
      });

      if (order.image_3d_urls && order.image_3d_urls.length > 0) {
        console.log("Found 3D images in order:", order.image_3d_urls);
        const combined = order.image_3d_urls.map((url, idx) => ({
          url,
          metadata: order.image_3d?.[idx],
        }));
        setExistingImage3d(combined);
        setSelectedModelIndex(0);
      } else {
        console.log("No 3D image URLs found in order object");
      }
    }
  }, [isEdit, order?.order_id, form]);

  /* ---------- FETCH PRODUCT IMAGE ---------- */
  useEffect(() => {
    if (!selectedProductList || !selectedProductType) {
      setPreviewImage(null);
      return;
    }

    fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/orders/product-image?listName=${encodeURIComponent(
        selectedProductList,
      )}&typeName=${encodeURIComponent(selectedProductType)}`,
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setPreviewImage(res.data);
        } else {
          setPreviewImage(null);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch product image", err);
        setPreviewImage(null);
      });
  }, [selectedProductList, selectedProductType]);

  // No redundant fetch needed here, managed by fetchLists on mount

  // 2. Fetch Product Types when List Changes
  const selectedList = form.watch("product_list");
  useEffect(() => {
    async function fetchTypes() {
      if (!selectedList) {
        setProductTypes([]);
        return;
      }
      try {
        const types = await getProductTypes(selectedList);
        setProductTypes(types);
      } catch (error) {
        console.error("Failed to fetch product types:", error);
      }
    }
    fetchTypes();
  }, [selectedList]);

  // 3. Fetch Product Image when Type Changes
  const selectedType = form.watch("product_type");
  useEffect(() => {
    async function fetchImage() {
      if (!selectedList || !selectedType) {
        setPreviewImage(null);
        return;
      }
      try {
        const imageBase64 = await getProductImage(selectedList, selectedType);
        setPreviewImage(imageBase64);
      } catch (error) {
        console.error("Failed to fetch product image:", error);
        setPreviewImage(null);
      }
    }
    fetchImage();
  }, [selectedList, selectedType]);

  /* ---------- SUBMIT ---------- */
  async function onSubmit(values: FormValues) {
    const formData = new FormData();
    formData.append("patient_id", patientId);
    formData.append("product_list", values.product_list);
    formData.append("product_type", values.product_type);

    const flattenedTeeth = values.tooth_numbers.flat();
    flattenedTeeth.forEach((tooth) => {
      formData.append("tooth_numbers", String(Number(tooth)));
    });

    formData.append("shade", values.shade);
    formData.append("priority", values.priority);
    formData.append("order_date", values.order_date.toISOString());
    formData.append(
      "expected_delivery",
      values.expected_delivery.toISOString(),
    );

    if (values.design_notes) {
      formData.append("design_notes", values.design_notes);
    }

    if (values.image?.[0]) {
      formData.append("image", values.image[0]);
    }

    const clinicId = localStorage.getItem("tenantId");
    if (clinicId) {
      formData.append("clinic_id", clinicId);
    }

    const addressId = localStorage.getItem("addressId");
    if (addressId) {
      formData.append("address_id", addressId);
    }

    // 🔹 Include 3D image files if selected
    if (image3dFiles.length > 0) {
      image3dFiles.forEach((file) => {
        formData.append("image_3d", file);
      });
    }

    // 🔹 Include remaining existing 3D images to keep
    if (isEdit) {
      const urlsToKeep = existingImage3d.map((item) => item.url);
      formData.append("existing_image_3d_urls", JSON.stringify(urlsToKeep));
    }

    setIsSubmitting(true);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (isEdit && order) {
        await updateOrder(order.order_id, formData);
      } else {
        const createdOrder = await createOrder(formData);
        console.log(createOrder);
        navigate(`/patients/${patientId}/products/${createdOrder.order_id}`);
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to submit order:", error);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  /* ---------- TEETH SELECTOR CONFIG ---------- */
  const teethLabels = [
    {
      text: t.products.form.teeth.upper,
      x: 146,
      y: 80,
      fontSize: 14,
      color: "#666",
    },
    {
      text: t.products.form.teeth.lower,
      x: 146,
      y: 290,
      fontSize: 14,
      color: "#666",
    },
  ];

  const FIXED_TEETH_COLORS: TeethColors = {
    defaultFill: "#FFFFFF",
    selectedFill: "#b51818",
    hoverFill: "#e06666",
    textDefault: "#000000",
    textSelected: "#FFFFFF",
    textSelectionbg: "#b51818",
  };

  const selectTriggerClass =
    "h-10 shadow-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* ========== PRODUCT SELECTION SECTION ========== */}
        <div className="space-y-4">
          {order?.comment && (
            <div className="rounded-lg border border-red-200 bg-red-100 p-4 shadow-sm">
              {/* Icon + Heading */}
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-red-700" />
                <span className="text-red-700 text-sm font-medium">
                  Message
                </span>
              </div>

              {/* Comment text */}
              <p className="mt-2 text-red-500 text-sm leading-relaxed">
                {order.comment}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 pt-6">
            <span className="h-6 w-1 bg-brand-500 rounded-full block"></span>
            <h3 className="text-sm font-bold">
              {t.products.form.productDetails}{" "}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PRODUCT LIST */}
            <FormField
              control={form.control}
              name="product_list"
              rules={{
                required: t.products.form.validation.productListRequired,
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t.products.form.productList}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue
                          placeholder={t.products.form.selectProductList}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productLists.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          {t.products.form.noProductLists}
                        </div>
                      ) : (
                        productLists.map((p) => (
                          <SelectItem key={p.list_id} value={p.list_name}>
                            {p.list_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PRODUCT TYPE */}
            <FormField
              control={form.control}
              name="product_type"
              rules={{
                required: t.products.form.validation.productTypeRequired,
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t.products.form.productType}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue
                          placeholder={t.products.form.selectProductType}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productTypes.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          {t.products.form.noProductTypes}
                        </div>
                      ) : (
                        productTypes.map((t) => (
                          <SelectItem key={t.product_id} value={t.product_name}>
                            {t.product_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* PREVIEW IMAGE */}
          {previewImage && (
            <div className="relative rounded-lg border border-gray-200 bg-gray-50 p-4">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors z-10"
                title={t.products.form.closePreview}
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
              <img
                src={`data:image/png;base64,${previewImage}`}
                alt={t.products.form.productPreview}
                className="w-full max-w-md mx-auto rounded-md"
                onError={(e) => {
                  console.error("Image failed to load:", previewImage);
                  e.currentTarget.src = "/placeholder-image.png";
                }}
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                {t.products.form.productPreview}
              </p>
            </div>
          )}
        </div>

        {/* ========== SHADE SELECTION SECTION ========== */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pt-6">
            <span className="h-6 w-1 bg-brand-500 rounded-full block"></span>
            <h3 className="text-sm font-bold">
              {t.products.form.shadeSelection}{" "}
            </h3>
          </div>

          <FormField
            control={form.control}
            name="shade"
            rules={{ required: t.products.form.validation.shadeRequired }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t.products.form.shade}{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <SelectableToothGrid
                    options={restorationShade}
                    value={field.value}
                    onChange={(val) =>
                      form.setValue("shade", val, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                  />
                </FormControl>
                {field.value && (
                  <div className="mt-2 text-sm text-gray-600">
                    {t.products.form.selectedShade}:{" "}
                    <span className="font-semibold">{field.value}</span>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ========== TOOTH SELECTION SECTION ========== */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pt-6">
            <span className="h-6 w-1 bg-brand-500 rounded-full block"></span>
            <h3 className="text-sm font-bold">
              {t.products.form.toothSelection}{" "}
            </h3>
          </div>

          <FormField
            control={form.control}
            name="tooth_numbers"
            rules={{
              validate: (v) =>
                v.length > 0 || t.products.form.validation.toothRequired,
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t.products.form.selectTeeth}{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="flex justify-center bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <TeethSelector
                      labels={teethLabels}
                      colors={FIXED_TEETH_COLORS}
                      toothSelection={field.value}
                      onSelectionChange={(v) =>
                        form.setValue("tooth_numbers", v, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                    />
                  </div>
                </FormControl>

                {/* Display selected teeth */}
                {field.value.length > 0 && (
                  <div className="mt-3 p-3 bg-brand-50 border border-brand-200 rounded-md">
                    <p className="text-xs font-medium text-brand-900 mb-1">
                      {t.products.form.selectedTeeth}:
                    </p>
                    <p className="text-sm text-brand-700">
                      {field.value
                        .flat()
                        .sort((a, b) => Number(a) - Number(b))
                        .map((n) => `#${n}`)
                        .join(", ")}
                    </p>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ========== ORDER DETAILS SECTION ========== */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pt-6">
            <span className="h-6 w-1 bg-brand-500 rounded-full block"></span>
            <h3 className="text-sm font-bold">
              {t.products.form.orderDetails}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* PRIORITY */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t.products.form.priority}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LOW">
                        {t.products.form.priorityOptions.low}
                      </SelectItem>
                      <SelectItem value="MEDIUM">
                        {t.products.form.priorityOptions.medium}
                      </SelectItem>
                      <SelectItem value="HIGH">
                        {t.products.form.priorityOptions.high}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* DESIGN NOTES */}

          <div className="flex items-center gap-2 pt-6">
            <span className="h-6 w-1 bg-brand-500 rounded-full block"></span>
            <h3 className="text-sm font-bold">{t.products.form.designNotes}</h3>
          </div>

          <FormField
            control={form.control}
            name="design_notes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={t.products.form.notesPlaceholder}
                    className="min-h-[100px] resize-none text-sm"
                    disabled={isSubmitting}
                    maxLength={300}
                  />
                </FormControl>

                <div className="text-xs text-gray-500 text-right mt-1">
                  {field.value?.length || 0}/300 characters
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <label className="text-sm font-medium">
          <div className="flex items-center gap-2 pt-6 mb-4">
            <span className="h-6 w-1 bg-brand-500 rounded-full block"></span>
            <h3 className="text-sm font-bold">{t.products.form.upload3D} </h3>
          </div>
        </label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <input
              ref={image3dInputRef}
              type="file"
              multiple
              accept=".stl,.obj,.ply,.glb,.gltf,.dcm,.nrrd"
              onChange={(e) => {
                if (e.target.files) {
                  const files = Array.from(e.target.files);
                  if (files.length + image3dFiles.length > 4) {
                    alert(t.products.form.max3DAlert);
                    return;
                  }
                  setImage3dFiles((prev) => [...prev, ...files]);
                }
              }}
              className="hidden"
              id="image_3d_input"
            />
            <Button
              type="button"
              onClick={() => image3dInputRef.current?.click()}
              className="h-9 rounded-md  px-4 text-sm font-medium text-white transition-opacity duration-200 bg-brand-button  hover:bg-brand-button/80"
            >
              {t.products.form.add3DButton}
            </Button>
          </div>

          {/* 3D MODEL VIEWER PREVIEW */}
          {existingImage3d.length > 0 && selectedModelIndex !== null && (
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100 shadow-sm mb-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-500" />
                {t.products.form.modelPreview}
              </h3>
              {/* Thumbnails / Switcher */}
              {existingImage3d.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-5">
                  {existingImage3d.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedModelIndex(idx)}
                      className={`
                        px-2 py-1 rounded border flex items-center gap-1 bg-white min-w-[60px] transition-all
                        ${selectedModelIndex === idx ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}
                      `}
                    >
                      <Layers className="w-3 h-3 text-gray-500" />
                      <span className="text-[10px] font-medium text-gray-600">
                        {item.metadata?.file_name?.split(".")[0] ||
                          `Model ${idx + 1}`}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="w-full h-[400px] border rounded-lg bg-gray-900 overflow-hidden relative">
                {existingImage3d[selectedModelIndex] ? (
                  <ThreeDimensionalViewer
                    key={`3d-viewer-${selectedModelIndex}-${existingImage3d[selectedModelIndex].url}`}
                    pathToFile={existingImage3d[selectedModelIndex].url}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    {t.common?.loading || "Loading Model..."}
                  </div>
                )}
              </div>
            </div>
          )}

          {existingImage3d.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-xs font-medium text-gray-500">
                {t.products.form.manageExisting3D}
              </p>
              {existingImage3d.map((item, index) => (
                <div
                  key={`existing-${index}`}
                  className="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-100"
                >
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <button
                      type="button"
                      onClick={() => setSelectedModelIndex(index)}
                      className="hover:underline flex items-center gap-2"
                    >
                      <Layers className="w-4 h-4" />
                      <span className="truncate max-w-[200px]">
                        {item.url.split("/").pop()?.split("?")[0] ||
                          `3D Image ${index + 1}`}
                      </span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = existingImage3d.filter(
                        (_, i) => i !== index,
                      );
                      setExistingImage3d(newImages);
                      if (selectedModelIndex === index) {
                        setSelectedModelIndex(newImages.length > 0 ? 0 : null);
                      } else if (
                        selectedModelIndex !== null &&
                        selectedModelIndex > index
                      ) {
                        setSelectedModelIndex(selectedModelIndex - 1);
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {image3dFiles.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              {image3dFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded border"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <span className="text-gray-400">
                      ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newFiles = [...image3dFiles];
                      newFiles.splice(index, 1);
                      setImage3dFiles(newFiles);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-500">
            {t.products.form.supportedFormats}
          </p>
        </div>
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 rounded-md px-4 text-sm font-medium text-white transition-opacity duration-200 bg-brand-button hover:bg-brand-button/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {isEdit
                    ? t.products.form.updateOrderButton
                    : t.products.form.createOrderButton}
                </span>
              </div>
            ) : isEdit ? (
              t.products.form.updateOrderButton
            ) : (
              t.products.form.createOrderButton
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
