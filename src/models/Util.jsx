export function unionize_objects ( objects_array ) {
    const unique_objs = new Set ( objects_array.map( obj => JSON.stringify ( obj ) ) );
    return Array.from ( unique_objs ).map( objString => JSON.parse ( objString ) );
  }