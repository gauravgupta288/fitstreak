import { Schema, model, Document } from 'mongoose';

export interface IExerciseLibrary extends Document {
  name: string;
  muscleGroup: string;
  createdAt: Date;
}

const exerciseLibrarySchema = new Schema<IExerciseLibrary>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    muscleGroup: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IExerciseLibrary>('ExerciseLibrary', exerciseLibrarySchema);
