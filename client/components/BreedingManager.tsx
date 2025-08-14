import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Baby,
  Heart,
  Calendar,
  User,
  FileText,
  Trash2,
  Edit,
  Users,
  MaleIcon,
  Female,
  Rabbit,
} from "lucide-react";
import {
  AnimalRecord,
  BreedingRecord,
  AnimalGender,
} from "@shared/animal-types";
import * as animalApi from "@/lib/animal-api";
import { useToast } from "@/hooks/use-toast";
import AnimalForm from "./AnimalForm";

interface BreedingManagerProps {
  mother: AnimalRecord;
  allAnimals: AnimalRecord[];
  onUpdateAnimals: () => void;
}

interface KidFormData {
  name: string;
  gender: AnimalGender;
  weight: string;
  status: "alive" | "stillborn" | "died_after_birth";
  markings: string;
  notes: string;
  createAnimalRecord: boolean;
}

interface BreedingFormData {
  fatherId: string;
  breedingDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate: string;
  breedingMethod: "natural" | "artificial_insemination";
  veterinarianName: string;
  complications: string;
  notes: string;
  kids: KidFormData[];
}

export default function BreedingManager({
  mother,
  allAnimals,
  onUpdateAnimals,
}: BreedingManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<BreedingFormData>({
    fatherId: "unknown",
    breedingDate: "",
    expectedDeliveryDate: "",
    actualDeliveryDate: new Date().toISOString().split("T")[0],
    breedingMethod: "natural",
    veterinarianName: "",
    complications: "",
    notes: "",
    kids: [
      {
        name: "",
        gender: "female",
        weight: "",
        status: "alive",
        markings: "",
        notes: "",
        createAnimalRecord: true,
      },
    ],
  });
  const { toast } = useToast();

  // Get male animals for father selection
  const maleAnimals = allAnimals.filter(
    (animal) => animal.gender === "male" && animal.status === "active",
  );

  useEffect(() => {
    if (isDialogOpen) {
      loadBreedingRecords();
    }
  }, [isDialogOpen, mother.id]);

  const loadBreedingRecords = async () => {
    try {
      setLoading(true);
      const records = await animalApi.fetchBreedingRecords(mother.id);
      setBreedingRecords(records);
    } catch (error) {
      console.error("Error loading breeding records:", error);
      toast({
        title: "Error",
        description: "Failed to load breeding records.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addKid = () => {
    setFormData((prev) => ({
      ...prev,
      kids: [
        ...prev.kids,
        {
          name: "",
          gender: "female",
          weight: "",
          status: "alive",
          markings: "",
          notes: "",
          createAnimalRecord: true,
        },
      ],
    }));
  };

  const removeKid = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      kids: prev.kids.filter((_, i) => i !== index),
    }));
  };

  const updateKid = (
    index: number,
    field: keyof KidFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      kids: prev.kids.map((kid, i) =>
        i === index ? { ...kid, [field]: value } : kid,
      ),
    }));
  };

  const calculateExpectedDelivery = (breedingDate: string) => {
    if (breedingDate) {
      const breeding = new Date(breedingDate);
      const expectedDays = mother.type === "goat" ? 150 : 147; // Goat: ~150 days, Sheep: ~147 days
      breeding.setDate(breeding.getDate() + expectedDays);
      return breeding.toISOString().split("T")[0];
    }
    return "";
  };

  const handleBreedingDateChange = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      breedingDate: date,
      expectedDeliveryDate: calculateExpectedDelivery(date),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.actualDeliveryDate || formData.kids.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in delivery date and add at least one kid.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Create breeding record
      const breedingRecord = await animalApi.createBreedingRecord({
        motherId: mother.id,
        fatherId:
          formData.fatherId !== "unknown" ? formData.fatherId : undefined,
        breedingDate: formData.breedingDate || formData.actualDeliveryDate,
        expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
        actualDeliveryDate: formData.actualDeliveryDate,
        totalKids: formData.kids.length,
        maleKids: formData.kids.filter((kid) => kid.gender === "male").length,
        femaleKids: formData.kids.filter((kid) => kid.gender === "female")
          .length,
        breedingMethod: formData.breedingMethod,
        veterinarianName: formData.veterinarianName || undefined,
        complications: formData.complications || undefined,
        notes: formData.notes || undefined,
        kidDetails: formData.kids.map((kid) => ({
          name: kid.name || undefined,
          gender: kid.gender,
          weight: kid.weight ? parseFloat(kid.weight) : undefined,
          status: kid.status,
        })),
      });

      // Create animal records for living kids if requested
      const newAnimalIds: string[] = [];
      for (const kid of formData.kids) {
        if (kid.createAnimalRecord && kid.status === "alive" && kid.name) {
          try {
            const newAnimal = await animalApi.createAnimal({
              name: kid.name,
              type: mother.type,
              breed: mother.breed,
              gender: kid.gender,
              dateOfBirth: formData.actualDeliveryDate,
              photos: [],
              status: "active",
              currentWeight: kid.weight ? parseFloat(kid.weight) : undefined,
              markings: kid.markings || undefined,
              motherId: mother.id,
              fatherId:
                formData.fatherId !== "unknown" ? formData.fatherId : undefined,
              breedingRecordId: breedingRecord.id,
              offspring: [],
              insured: false,
              notes: kid.notes || undefined,
            });
            newAnimalIds.push(newAnimal.id);
          } catch (error) {
            console.error(
              `Error creating animal record for ${kid.name}:`,
              error,
            );
          }
        }
      }

      // Update mother's offspring list
      if (newAnimalIds.length > 0) {
        try {
          const updatedMother = {
            ...mother,
            offspring: [...(mother.offspring || []), ...newAnimalIds],
            updatedAt: new Date().toISOString(),
          };
          await animalApi.updateAnimal(mother.id, updatedMother);
        } catch (error) {
          console.error("Error updating mother's offspring:", error);
        }
      }

      // Update father's offspring list if father is selected
      if (
        formData.fatherId !== "unknown" &&
        formData.fatherId &&
        newAnimalIds.length > 0
      ) {
        try {
          const father = allAnimals.find((a) => a.id === formData.fatherId);
          if (father) {
            const updatedFather = {
              ...father,
              offspring: [...(father.offspring || []), ...newAnimalIds],
              updatedAt: new Date().toISOString(),
            };
            await animalApi.updateAnimal(formData.fatherId, updatedFather);
          }
        } catch (error) {
          console.error("Error updating father's offspring:", error);
        }
      }

      toast({
        title: "Success",
        description: `Breeding record created with ${formData.kids.length} kids. ${newAnimalIds.length} new animal records created.`,
      });

      // Refresh breeding records first, then close dialog
      await loadBreedingRecords();
      setIsDialogOpen(false);
      resetForm();
      onUpdateAnimals();
    } catch (error) {
      console.error("Error creating breeding record:", error);
      toast({
        title: "Error",
        description: "Failed to create breeding record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fatherId: "unknown",
      breedingDate: "",
      expectedDeliveryDate: "",
      actualDeliveryDate: new Date().toISOString().split("T")[0],
      breedingMethod: "natural",
      veterinarianName: "",
      complications: "",
      notes: "",
      kids: [
        {
          name: "",
          gender: "female",
          weight: "",
          status: "alive",
          markings: "",
          notes: "",
          createAnimalRecord: true,
        },
      ],
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFatherName = (fatherId?: string) => {
    if (!fatherId) return "Unknown";
    const father = allAnimals.find((a) => a.id === fatherId);
    return father ? father.name : "Unknown";
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Rabbit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Breeding & Offspring Management - {mother.name}
          </DialogTitle>
          <DialogDescription>
            Record births and manage offspring for {mother.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(90vh-120px)]">
          {/* Breeding History */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Breeding History</h3>
            <ScrollArea className="h-[calc(90vh-300px)] min-h-[400px] border rounded-md p-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-pink-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">
                    Loading breeding records...
                  </p>
                </div>
              ) : breedingRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Baby className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No breeding records found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {breedingRecords.map((record) => (
                    <Card key={record.id} className="border-pink-200">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-pink-100 text-pink-800">
                              {record.totalKids} Kid
                              {record.totalKids !== 1 ? "s" : ""}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {formatDate(
                                record.actualDeliveryDate ||
                                  record.breedingDate,
                              )}
                            </span>
                          </div>
                          <div className="text-sm space-y-1">
                            <p>
                              <strong>Father:</strong>{" "}
                              {getFatherName(record.fatherId)}
                            </p>
                            {record.maleKids !== undefined &&
                              record.femaleKids !== undefined && (
                                <p>
                                  <strong>Gender:</strong> {record.maleKids}�� /{" "}
                                  {record.femaleKids}♀
                                </p>
                              )}
                            {record.breedingMethod && (
                              <p>
                                <strong>Method:</strong>{" "}
                                {record.breedingMethod.replace("_", " ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* New Breeding Record Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Add New Birth Record
            </h3>
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
              💡 <strong>Tip:</strong> Use this form to record new births and
              offspring. You can add multiple kids per birth and choose to
              automatically create animal records for living offspring.
            </p>
            <ScrollArea className="h-[calc(90vh-300px)] min-h-[400px]">
              <form onSubmit={handleSubmit} className="space-y-4 pr-3">
                {/* Breeding Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    Breeding Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fatherId">Father (Optional)</Label>
                      <Select
                        value={formData.fatherId}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, fatherId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select father" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unknown">
                            Unknown/No Record
                          </SelectItem>
                          {maleAnimals.map((male) => (
                            <SelectItem key={male.id} value={male.id}>
                              {male.name} ({male.breed})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="breedingDate">
                        Breeding Date (Optional)
                      </Label>
                      <Input
                        id="breedingDate"
                        type="date"
                        value={formData.breedingDate}
                        onChange={(e) =>
                          handleBreedingDateChange(e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="actualDeliveryDate">Birth Date *</Label>
                      <Input
                        id="actualDeliveryDate"
                        type="date"
                        value={formData.actualDeliveryDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            actualDeliveryDate: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="breedingMethod">Breeding Method</Label>
                      <Select
                        value={formData.breedingMethod}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            breedingMethod: value as
                              | "natural"
                              | "artificial_insemination",
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="natural">Natural</SelectItem>
                          <SelectItem value="artificial_insemination">
                            Artificial Insemination
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Kids Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Baby className="h-4 w-4 text-pink-600" />
                      Kids Information
                      <Badge variant="secondary" className="text-xs">
                        {formData.kids.length} Kid
                        {formData.kids.length !== 1 ? "s" : ""}
                      </Badge>
                    </h4>
                    <Button
                      type="button"
                      onClick={addKid}
                      size="sm"
                      className="bg-pink-600 hover:bg-pink-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Kid
                    </Button>
                  </div>

                  <ScrollArea className="max-h-96 pr-2">
                    <div className="space-y-3">
                      {formData.kids.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-pink-200 rounded-lg bg-pink-50/30">
                          <Baby className="h-8 w-8 mx-auto mb-2 text-pink-400" />
                          <p className="text-pink-600 font-medium mb-1">
                            No kids added yet
                          </p>
                          <p className="text-pink-500 text-sm">
                            Click "Add Kid" to record offspring details
                          </p>
                        </div>
                      ) : (
                        formData.kids.map((kid, index) => (
                          <Card
                            key={index}
                            className="border-pink-200 bg-pink-50/30"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <Baby className="h-4 w-4 text-pink-600" />
                                  Kid #{index + 1}
                                  {kid.name && (
                                    <span className="text-pink-600 font-normal">
                                      - {kid.name}
                                    </span>
                                  )}
                                </CardTitle>
                                {formData.kids.length > 1 && (
                                  <Button
                                    type="button"
                                    onClick={() => removeKid(index)}
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label>Name</Label>
                                  <Input
                                    value={kid.name}
                                    onChange={(e) =>
                                      updateKid(index, "name", e.target.value)
                                    }
                                    placeholder="Kid's name"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Gender</Label>
                                  <Select
                                    value={kid.gender}
                                    onValueChange={(value) =>
                                      updateKid(
                                        index,
                                        "gender",
                                        value as AnimalGender,
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="female">
                                        Female
                                      </SelectItem>
                                      <SelectItem value="male">Male</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label>Birth Weight (kg)</Label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={kid.weight}
                                    onChange={(e) =>
                                      updateKid(index, "weight", e.target.value)
                                    }
                                    placeholder="Weight at birth"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Status</Label>
                                  <Select
                                    value={kid.status}
                                    onValueChange={(value) =>
                                      updateKid(
                                        index,
                                        "status",
                                        value as
                                          | "alive"
                                          | "stillborn"
                                          | "died_after_birth",
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="alive">
                                        Alive
                                      </SelectItem>
                                      <SelectItem value="stillborn">
                                        Stillborn
                                      </SelectItem>
                                      <SelectItem value="died_after_birth">
                                        Died After Birth
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Markings</Label>
                                <Input
                                  value={kid.markings}
                                  onChange={(e) =>
                                    updateKid(index, "markings", e.target.value)
                                  }
                                  placeholder="Physical markings"
                                />
                              </div>

                              {kid.status === "alive" && (
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`create-record-${index}`}
                                    checked={kid.createAnimalRecord}
                                    onCheckedChange={(checked) =>
                                      updateKid(
                                        index,
                                        "createAnimalRecord",
                                        checked as boolean,
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`create-record-${index}`}
                                    className="text-sm font-normal"
                                  >
                                    Create animal record for this kid
                                  </Label>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <Separator />

                {/* Additional Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    Additional Information
                  </h4>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="veterinarianName">Veterinarian</Label>
                      <Input
                        id="veterinarianName"
                        value={formData.veterinarianName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            veterinarianName: e.target.value,
                          }))
                        }
                        placeholder="Attending veterinarian"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="complications">Complications</Label>
                      <Textarea
                        id="complications"
                        value={formData.complications}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            complications: e.target.value,
                          }))
                        }
                        placeholder="Any birth complications"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Additional notes"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </ScrollArea>
          </div>
        </div>

        {/* Actions */}
        <Separator />
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-pink-600 hover:bg-pink-700"
          >
            {submitting ? "Creating..." : "Create Birth Record"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
